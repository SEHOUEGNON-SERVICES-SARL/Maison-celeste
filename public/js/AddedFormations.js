document.getElementById('addFormationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('categorie_id', this.categorie_id.value);
    formData.append('titre', this.titre.value);
    formData.append('description', this.description.value);
    formData.append('fichier', this.fichier.files[0]);

    try {
      const response = await axios.post('https://maison-celeste.onrender.com/api/Addformations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Réponse du serveur:', response.data);
      alert('Formation ajoutée avec succès !');
      // Réinitialiser le formulaire ou rediriger vers une autre page
      this.reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la formation:', error);
      alert('Erreur lors de l\'ajout de la formation. Veuillez vérifier la console pour plus de détails.');
    }
  });