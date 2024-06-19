const express = require('express');
const path = require('path'); 
const bodyParser = require('body-parser');
const cors = require('cors'); 
const routes = require('./routes');
const fs = require('fs');
const admin = require('firebase-admin');


if (!admin.apps.length) {
  // Initialisez Firebase Admin SDK avec vos informations d'authentification
  const serviceAccount = require('serviceAccountKey.json'); // Remplacez par le chemin de votre fichier serviceAccountKey.json

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Ajoutez toute autre configuration nécessaire
  });
}

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uploadDir = path.join(__dirname, 'uploads'); // Chemin absolu vers le dossier uploads

// Définir le dossier public pour servir les fichiers statiques (HTML, CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/files/uploads', express.static(path.join(__dirname, 'uploads')));

// Utilisation des routes API
app.use('/api', routes);

//app.use('/api', egliseCelesteRoutes);


app.get('/api/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
      if (err) {
          console.error("Erreur lors de la lecture du répertoire uploads:", err);
          return res.status(500).json({ message: "Erreur lors de la récupération des fichiers" });
      }

      // Générer la liste des fichiers avec leurs liens
      const fileDetails = files.map(file => {
          const filePath = path.join('/uploads', file); // Lien relatif vers le fichier
          return {
              name: file,
              link: filePath
          };
      });

      res.json(fileDetails);
  });
});

app.get('/api/firebase/*', async (req, res) => {
  const filePath = req.params[0]; // Récupérer le chemin complet du fichier depuis l'URL

  try {
    const bucket = admin.storage().bucket();

    const file = bucket.file(filePath); // Utilisez directement le chemin complet du fichier

    const [exists] = await file.exists();

    if (exists) {
      const stream = file.createReadStream();
      stream.pipe(res);
    } else {
      console.error('Le fichier n\'existe pas dans Firebase Storage');
      res.status(404).json({ message: 'Le fichier n\'existe pas' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier depuis Firebase Storage:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du fichier' });
  }
});

app.get('/api/files/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads', fileName);

  res.sendFile(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

