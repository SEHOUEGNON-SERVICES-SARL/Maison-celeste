document.getElementById('addCantiqueForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('categorie_id', this.categorie_id.value);
    formData.append('titre', this.titre.value);
    formData.append('text', this.text.value);
    formData.append('language', this.language.value);
    formData.append('audioFile', this.audioFile.files[0]);

    try {
      const response = await axios.post('https://maisonccc.onrender.com/api/addCantiques', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Réponse du serveur:', response.data);
      alert('Cantique ajouté avec succès !');
      // Rediriger ou afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de l\'ajout du cantique:', error);
      alert('Erreur lors de l\'ajout du cantique.');
    }
  });