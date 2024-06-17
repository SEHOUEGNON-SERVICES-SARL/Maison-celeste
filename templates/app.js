document.addEventListener('DOMContentLoaded', function() {
    const cantiqueForm = document.getElementById('cantiqueForm');
  
    cantiqueForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Empêche l'envoi du formulaire par défaut
  
      const formData = new FormData(cantiqueForm);
  
      fetch('http://localhost:3000/api/cantiques', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de l\'ajout du cantique');
        }
        return response.json();
      })
      .then(data => {
        console.log('Cantique ajouté avec succès, ID:', data.id);
        // Vous pouvez rediriger l'utilisateur vers une autre page ou effectuer d'autres actions ici
      })
      .catch(error => {
        console.error('Erreur:', error.message);
        // Gérer les erreurs et afficher un message à l'utilisateur si nécessaire
      });
    });
  });
  