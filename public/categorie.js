document.addEventListener('DOMContentLoaded', function() {
    const categorieForm = document.getElementById('categorieForm');
  
    categorieForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Empêche l'envoi du formulaire par défaut
  
      const formData = new FormData(categorieForm);
      const data = {
        nom: formData.get('nom'),
        image: formData.get('image')
      };
  
      fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Définir le type de contenu de la requête
        },
        body: JSON.stringify(data) // Convertir les données en JSON
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de l\'ajout de la catégorie');
        }
        return response.json();
      })
      .then(data => {
        console.log('Catégorie ajoutée avec succès, ID:', data.id);
        // Vous pouvez rediriger l'utilisateur vers une autre page ou effectuer d'autres actions ici
      })
      .catch(error => {
        console.error('Erreur:', error.message);
        // Gérer les erreurs et afficher un message à l'utilisateur si nécessaire
      });
    });
  });
  