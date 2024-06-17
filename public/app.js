document.addEventListener('DOMContentLoaded', function() {
  const cantiqueForm = document.getElementById('cantiqueForm');

  cantiqueForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire par défaut

    const formData = new FormData(cantiqueForm);
    const data = {
      categorie_id: formData.get('categorie_id'),
      titre: formData.get('titre'),
      text: formData.get('text')
    };

    fetch('http://localhost:3000/api/cantiques', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Définir le type de contenu de la requête
      },
      body: JSON.stringify(data) // Convertir les données en JSON
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
