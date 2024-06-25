document.getElementById('addEgliseCelesteForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    

    try {
      const response = await axios.post('https://maison-celeste.onrender.com/api/addEgliseCeleste', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Réponse du serveur:', response.data);
      alert('Document céleste ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document céleste:', error);
      alert('Eglise ajouter.');
    }
  });