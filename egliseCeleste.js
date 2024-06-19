const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('./db');
const fs = require('fs');
const router = express.Router();

// Configuration Multer pour gérer l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});



const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (['image', 'image1', 'image2'].includes(file.fieldname)) {
        cb(null, true);
      } else {
        cb(new Error('Unexpected field'));
      }
    }
  });
  
  // Route POST pour ajouter une église céleste
router.post('/addEgliseCeleste', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]), async (req, res) => {
    const { categorie_id, nom, adresse } = req.body;
    const files = req.files;
  
    if (!categorie_id || !nom || !files['image'] || !files['image1'] || !files['image2']) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }
  
    try {
      const uploadFile = async (file) => {
        const destination = `eglise_celeste/${Date.now()}_${path.basename(file.originalname)}`;
        await bucket.upload(file.path, {
          destination: destination,
          metadata: {
            contentType: file.mimetype,
          },
        });
  
        // Supprimer le fichier local après l'upload
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error('Erreur lors de la suppression du fichier local:', err);
          }
        });
  
        return destination;
      };
  
      const imagePath = await uploadFile(files['image'][0]);
      const imagePath1 = await uploadFile(files['image1'][0]);
      const imagePath2 = await uploadFile(files['image2'][0]);
  
      const query = 'INSERT INTO eglise_celeste (categorie_id, nom, adresse, image, image1, image2) VALUES (?, ?, ?, ?, ?, ?)';
      const [result] = await db.query(query, [categorie_id, nom, adresse, imagePath, imagePath1, imagePath2]);
  
      res.status(201).json({ id: result.insertId, message: "Église céleste ajoutée avec succès" });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'église céleste:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout de l'église céleste" });
    }
  });
  
  module.exports = router;