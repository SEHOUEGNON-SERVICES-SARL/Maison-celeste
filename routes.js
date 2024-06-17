// routes.js
const express = require('express');
const multer = require('multer'); // Middleware pour gérer les fichiers multipart/form-data
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    // Génère un nom de fichier unique en ajoutant un timestamp au nom original du fichier
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route pour récupérer toutes les catégories
router.get('/categories', (req, res) => {
  db.query('SELECT * FROM categorie', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

router.post('/connexion', (req, res) => {
  const { email, password } = req.body;

  // Vérification que tous les champs requis sont présents
  if (!email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  // Vérification de l'existence de l'utilisateur
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(getUserQuery, [email], async (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
    if (result.length === 0) {
      return res.status(401).json({ message: 'L\'utilisateur n\'existe pas' });
    }

    // Vérification du mot de passe
    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Création du token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ id: user.id, token, message: 'Connexion réussie' });
  });
});

router.post('/auth', (req, res) => {
  const { tel } = req.body;

  if (!tel) {
    return res.status(400).json({ message: 'Le numéro de téléphone est requis' });
  }

  // Vérification de l'existence de l'utilisateur
  const checkUserQuery = 'SELECT * FROM users WHERE tel = ?';
  db.query(checkUserQuery, [tel], (err, result) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', err);
      return res.status(500).json({ message: 'Erreur lors de la vérification de l\'utilisateur' });
    }

    if (result.length > 0) {
      // L'utilisateur existe, générer un token JWT pour la connexion
      const user = result[0];
      const token = jwt.sign({ id: user.id, tel: user.tel }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ id: user.id, token, message: 'Connexion réussie' });
    } else {
      // L'utilisateur n'existe pas, l'inscrire
      const insertUserQuery = 'INSERT INTO users (tel) VALUES (?)';
      db.query(insertUserQuery, [tel], (err, result) => {
        if (err) {
          console.error('Erreur lors de l\'insertion de l\'utilisateur:', err);
          return res.status(500).json({ message: 'Erreur lors de l\'insertion de l\'utilisateur' });
        }

        // Création du token JWT
        const userId = result.insertId;
        const token = jwt.sign({ id: userId, tel }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ id: userId, token, message: 'Inscription réussie' });
      });
    }
  });
});

router.post('/Inscription', upload.single('photo'), async (req, res) => {
  const { username, tel, email, password } = req.body;
  const photo = req.file; // Contient les informations sur le fichier photo

  // Vérification que tous les champs requis sont présents
  if (!username || !tel || !email || !password || !photo) {
    // Supprime le fichier téléchargé en cas d'erreur
    if (photo) {
      fs.unlinkSync(photo.path);
    }
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }


  try {
    // Vérification si l'utilisateur existe déjà
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, result) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', err);
        return res.status(500).json({ message: 'Erreur lors de la vérification de l\'utilisateur' });
      }
      if (result.length > 0) {
        return res.status(409).json({ message: 'L\'utilisateur existe déjà' });
      }

      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer l'utilisateur dans la base de données
      const insertUserQuery = 'INSERT INTO users (username, photo, tel, email, password) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [username, photo.path, tel, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Erreur lors de l\'inscription de l\'utilisateur:', err);
          // Supprime le fichier téléchargé en cas d'erreur lors de l'insertion dans la base de données
          fs.unlinkSync(photo.path);
          return res.status(500).json({ message: 'Erreur lors de l\'inscription de l\'utilisateur' });
        }
        // Création du token JWT
        const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ id: result.insertId, token, message: 'Inscription réussie' });
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Requête SQL pour récupérer les informations de l'utilisateur
  const query = 'SELECT * FROM users WHERE id = ?';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des informations de l'utilisateur:", err);
      res.status(500).send("Erreur lors de la récupération des informations de l'utilisateur");
    } else {
      if (results.length > 0) {
        res.json(results[0]); // Envoie les détails du premier résultat (il ne devrait y en avoir qu'un car l'ID est unique)
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    }
  });
});

router.get('/language/:language', (req, res) => {
  const { language } = req.params;
  const selectQuery = 'SELECT * FROM cantique WHERE language = ?';
  db.query(selectQuery, [language], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cantiques:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des cantiques' });
    }
    res.status(200).json(results);
  });
});


router.post('/addCantiques', (req, res) => {
  const { categorie_id, titre, text, audio_path, language } = req.body;
  if (!titre || !language) {
    return res.status(400).json({ message: 'Le titre et la langue sont requis' });
  }

  const insertQuery = 'INSERT INTO cantique (categorie_id, titre, text, audio_path, language) VALUES (?, ?, ?, ?, ?)';
  db.query(insertQuery, [categorie_id, titre, text, audio_path, language], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion du cantique:', err);
      return res.status(500).json({ message: 'Erreur lors de l\'insertion du cantique' });
    }
    res.status(201).json({ id: result.insertId, message: 'Cantique ajouté avec succès' });
  });
});


router.get('/cantiques/:id', (req, res) => {
    const cantiqueId = req.params.id;
    db.query('SELECT * FROM cantique WHERE id = ?', [cantiqueId], (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération du cantique:", err);
        res.status(500).send("Erreur lors de la récupération du cantique");
      } else {
        if (results.length > 0) {
          res.json(results[0]); // Envoie les détails du premier résultat (il ne devrait y en avoir qu'un car l'ID est unique)
        } else {
          res.status(404).send("Cantique non trouvé");
        }
      }
    });
  });

  router.get('/formations', (req, res) => {
    db.query('SELECT * FROM formation_pro', (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des formations:", err);
            res.status(500).send("Erreur lors de la récupération des formations");
        } else {
            res.status(200).json(results);
        }
    });
});

router.get('/formations/:id', (req, res) => {
  const formationId = req.params.id;
  db.query('SELECT * FROM formation_pro WHERE id = ?', [formationId], (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération des détails de la formation:", err);
          res.status(500).send("Erreur lors de la récupération des détails de la formation");
      } else {
          if (results.length > 0) {
              res.status(200).json(results[0]); // Envoie les détails du premier résultat (il ne devrait y en avoir qu'un car l'ID est unique)
          } else {
              res.status(404).send("Formation non trouvée");
          }
      }
  });
});

/// route pour ajouter formation
  router.post('/Addformations', (req, res) => {
    const { categorie_id, titre, description, lien_formation } = req.body;
    db.query('INSERT INTO formation_pro (categorie_id, titre, description, lien_formation) VALUES (?, ?, ?, ?)',
        [categorie_id, titre, description, lien_formation],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de l'ajout de la formation:", err);
                res.status(500).send("Erreur lors de l'ajout de la formation");
            } else {
                res.status(201).json({ message: 'Formation ajoutée avec succès', id: result.insertId });
            }
        });
});

router.post('/cantiques', upload.single('audioFile'), (req, res) => {
  // Récupération des données envoyées avec la requête POST
  const { categorie_id, titre, text } = req.body;
  const audioFile = req.file; // Contient les informations sur le fichier audio

  // Vérification que toutes les données requises sont présentes
  if (!categorie_id || !titre || !text || !audioFile) {
      // Supprime le fichier téléchargé en cas d'erreur
      if (audioFile) {
          fs.unlinkSync(audioFile.path);
      }
      return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Requête SQL pour insérer le cantique dans la base de données
  const query = 'INSERT INTO cantique (categorie_id, titre, text, audio_path) VALUES (?, ?, ?, ?)';
  db.query(query, [categorie_id, titre, text, audioFile.path], (err, result) => {
      if (err) {
          console.error("Erreur lors de l'ajout du cantique:", err);
          // Supprime le fichier téléchargé en cas d'erreur lors de l'insertion dans la base de données
          fs.unlinkSync(audioFile.path);
          return res.status(500).json({ message: "Erreur lors de l'ajout du cantique" });
      }

      // Envoi de la réponse avec l'ID du nouveau cantique ajouté
      res.status(201).json({ id: result.insertId, message: "Cantique ajouté avec succès" });
  });
});
  
// Ajoutez d'autres routes pour les autres tables ici...

router.get('/allcantiques', (req, res) => {
    db.query('SELECT id, titre FROM cantique', (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des cantiques:", err);
        res.status(500).send("Erreur lors de la récupération des cantiques");
      } else {
        res.json(results);
      }
    });
  });  

router.post('/categories', (req, res) => {
    // Récupération des données envoyées avec la requête POST
    const { nom, image } = req.body;
  
    // Vérification que toutes les données requises sont présentes
    if (!nom || !image) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }
  
    // Requête SQL pour insérer la catégorie dans la base de données
    const query = 'INSERT INTO categorie (nom, image) VALUES (?, ?)';
    db.query(query, [nom, image], (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout de la catégorie:", err);
        return res.status(500).json({ message: "Erreur lors de l'ajout de la catégorie" });
      }
  
      // Envoi de la réponse avec l'ID de la nouvelle catégorie ajoutée
      res.status(201).json({ id: result.insertId, message: "Catégorie ajoutée avec succès" });
    });
  });

  router.post('/documents', (req, res) => {
    // Récupération des données envoyées avec la requête POST
    const { categorie_id, titre, description, fichier } = req.body;
  
    // Vérification que toutes les données requises sont présentes
    if (!categorie_id || !titre || !fichier) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }
  
    // Requête SQL pour insérer le document céleste dans la base de données
    const query = 'INSERT INTO document_celeste (categorie_id, titre, description, fichier) VALUES (?, ?, ?, ?)';
    db.query(query, [categorie_id, titre, description, fichier], (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout du document céleste:", err);
        return res.status(500).json({ message: "Erreur lors de l'ajout du document céleste" });
      }
  
      // Envoi de la réponse avec l'ID du nouveau document ajouté
      res.status(201).json({ id: result.insertId, message: "Document céleste ajouté avec succès" });
    });
  });

  router.get('/showdocuments', (req, res) => {
    // Requête SQL pour récupérer l'ID et le titre de tous les documents célestes
    const query = 'SELECT id, titre FROM document_celeste';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des documents célestes:", err);
        return res.status(500).json({ message: "Erreur lors de la récupération des documents célestes" });
      }
  
      // Envoi de la réponse avec les résultats
      res.status(200).json(results);
    });
  });

  // Route pour afficher les détails d'un document céleste par ID
router.get('/showdocuments/:id', (req, res) => {
  const documentId = req.params.id;

  // Requête SQL pour récupérer les détails d'un document céleste spécifique par ID
  const query = 'SELECT * FROM document_celeste WHERE id = ?';

  db.query(query, [documentId], (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération du document céleste:", err);
          return res.status(500).json({ message: "Erreur lors de la récupération du document céleste" });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "Document céleste non trouvé" });
      }

      // Envoi de la réponse avec les détails du document céleste trouvé
      res.status(200).json(results[0]); // Renvoie le premier résultat trouvé (il ne devrait y en avoir qu'un)
  });
});

router.post('/acapelas', upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), (req, res) => {
  const { categorie_id, titre, userId } = req.body;
  const lien_audio = req.files['audioFile'][0].path; // Chemin du fichier audio téléchargé
  const photo = req.files['photo'][0].path; // Chemin de la photo téléchargée

  // Vérification que tous les champs requis sont présents
  if (!categorie_id || !titre || !photo || !userId || !lien_audio) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  // Insertion de la nouvelle acapela dans la base de données
  const insertAcapelaQuery = 'INSERT INTO acapela (categorie_id, titre, lien_audio, photo, user_id) VALUES (?, ?, ?, ?, ?)';
  db.query(insertAcapelaQuery, [categorie_id, titre, lien_audio, photo, userId], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion de l\'acapela:', err);
      return res.status(500).json({ message: 'Erreur lors de l\'insertion de l\'acapela' });
    }

    const acapelaId = result.insertId;
    res.status(201).json({ id: acapelaId, message: 'Acapela insérée avec succès' });
  });
});

  router.get('/acapela', (req, res) => {
    const query = `
      SELECT acapela.id, acapela.titre, acapela.lien_audio, acapela.photo, acapela.review, users.username AS auteur
      FROM acapela
      INNER JOIN users ON acapela.user_id = users.id
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des acapela :', err);
        res.status(500).send('Erreur lors de la récupération des acapela');
        return;
      }
      res.json(results);
    });
});

router.post('/acapela/:id/commentaire', (req, res) => {
  const acapelaId = req.params.id;
  const { commentaire, userId } = req.body;

  // Vérifiez si tous les champs nécessaires sont présents
  if (!commentaire || !userId) {
      res.status(400).json({ message: 'Le commentaire et l\'ID utilisateur sont requis' });
      return;
  }

  // Début d'une transaction pour garantir la cohérence des données
  db.beginTransaction(err => {
      if (err) {
          console.error('Erreur lors du démarrage de la transaction :', err);
          res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
          return;
      }

      // Insérer le commentaire dans la table commentaire_acapela
      const insertCommentQuery = `
          INSERT INTO commentaire_acapela (acapela_id, commentaire, user_id)
          VALUES (?, ?, ?)
      `;
      db.query(insertCommentQuery, [acapelaId, commentaire, userId], (err, result) => {
          if (err) {
              console.error('Erreur lors de l\'insertion du commentaire :', err);
              return db.rollback(() => {
                  res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
              });
          }

          // Mettre à jour la colonne review dans la table acapela
          const updateReviewQuery = `
              UPDATE acapela
              SET review = review + 1
              WHERE id = ?
          `;
          db.query(updateReviewQuery, [acapelaId], (err, result) => {
              if (err) {
                  console.error('Erreur lors de la mise à jour de la review :', err);
                  return db.rollback(() => {
                      res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
                  });
              }

              // Confirmer la transaction
              db.commit(err => {
                  if (err) {
                      console.error('Erreur lors de la confirmation de la transaction :', err);
                      return db.rollback(() => {
                          res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
                      });
                  }

                  res.status(200).json({ message: 'Commentaire ajouté avec succès' });
              });
          });
      });
  });
});


router.get('/acapela/:id/commentaires', (req, res) => {
  const acapelaId = req.params.id;

  // Requête pour sélectionner les commentaires et les profils des utilisateurs
  const query = `
      SELECT commentaire_acapela.id AS commentaire_id, commentaire_acapela.commentaire, 
             commentaire_acapela.user_id, users.username, users.profession, users.photo AS user_photo
      FROM commentaire_acapela
      INNER JOIN users ON commentaire_acapela.user_id = users.id
      WHERE commentaire_acapela.acapela_id = ?
  `;

  db.query(query, [acapelaId], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des commentaires :', err);
          res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
          return;
      }

      // Si aucun commentaire n'est trouvé
      if (results.length === 0) {
          res.status(404).json({ message: 'Acapela non trouvé ou aucun commentaire disponible' });
          return;
      }

      // Format des résultats pour inclure les informations des utilisateurs
      const commentaires = results.map(commentaire => ({
          id: commentaire.commentaire_id,
          commentaire: commentaire.commentaire,
          utilisateur: {
              id: commentaire.user_id,
              username: commentaire.username,
              profession: commentaire.profession,
              photo: commentaire.user_photo
          }
      }));

      res.status(200).json(commentaires);
  });
});

router.get('/acapela/:id', (req, res) => {
    const id = req.params.id;

    const query = `
        SELECT acapela.id, acapela.titre, acapela.lien_audio, acapela.photo AS acapela_photo, acapela.review, users.username AS auteur, users.profession, users.photo AS user_photo
        FROM acapela
        INNER JOIN users ON acapela.user_id = users.id
        WHERE acapela.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des détails de l\'acapela :', err);
            res.status(500).send('Erreur lors de la récupération des détails de l\'acapela');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Acapela non trouvé');
            return;
        }

        const acapela = results[0];
        res.json(acapela);
    });
});

router.get('/users-with-reviews', (req, res) => {
    const query = `
    SELECT u.id, u.username, u.photo, u.review_count
    FROM users u
    INNER JOIN acapela a ON u.id = a.user_id
    GROUP BY u.id
    HAVING u.review_count >= 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs avec des avis :', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs avec des avis' });
      return;
    }
    res.json(results);
  });
});

router.get('/api/acapela/:id/reviews', (req, res) => {
    const acapelaId = req.params.id;
    const { review } = req.body;
  
    // Vérifier si la review est présente dans la requête
    if (!review) {
      res.status(400).json({ message: 'La review est requise' });
      return;
    }
  
    const sql = `
      UPDATE acapela
      SET review = CONCAT(COALESCE(review, ''), ?)
      WHERE id = ?
    `;
  
    db.query(sql, [`, ${review}`, acapelaId], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'ajout de la review à l\'acapela :', err);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la review à l\'acapela' });
        return;
      }
  
      // Mettre à jour le review_count de l'utilisateur correspondant
      const updateUserReviewCount = `
        UPDATE users u
        INNER JOIN acapela a ON u.id = a.user_id
        SET u.review_count = (
          SELECT COUNT(*)
          FROM acapela
          WHERE user_id = u.id
        )
        WHERE a.id = ?
      `;
  
      db.query(updateUserReviewCount, [acapelaId], (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du review_count de l\'utilisateur :', err);
          res.status(500).json({ message: 'Erreur lors de la mise à jour du review_count de l\'utilisateur' });
          return;
        }
  
        // Si la requête s'est exécutée avec succès, envoyer une réponse avec un message de succès
        res.status(200).json({ message: 'Review ajoutée avec succès à l\'acapela' });
      });
    });
  });

router.post('/ajouter-critique', (req, res) => {
    const { user_id, categorie_id, titre, lien_audio, photo, review } = req.body;
  
    // Vérification que toutes les données requises sont présentes
    if (!user_id || !categorie_id || !titre || !lien_audio || !photo || !review) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }
  
    // Requête SQL pour insérer la critique dans la base de données
    const query = 'INSERT INTO acapela (user_id, categorie_id, titre, lien_audio, photo, review) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [user_id, categorie_id, titre, lien_audio, photo, review], (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout de la critique :", err);
        return res.status(500).json({ message: "Erreur lors de l'ajout de la critique" });
      }
  
      // Mise à jour du nombre de critiques de l'utilisateur dans la table users
      const updateQuery = 'UPDATE users SET review_count = review_count + 1 WHERE id = ?';
      db.query(updateQuery, [user_id], (updateErr) => {
        if (updateErr) {
          console.error("Erreur lors de la mise à jour du nombre de critiques de l'utilisateur :", updateErr);
          return res.status(500).json({ message: "Erreur lors de la mise à jour du nombre de critiques de l'utilisateur" });
        }
  
        // Envoi de la réponse avec l'ID de la nouvelle critique ajoutée
        res.status(201).json({ id: result.insertId, message: "Critique ajoutée avec succès" });
      });
    });
  });



module.exports = router;
