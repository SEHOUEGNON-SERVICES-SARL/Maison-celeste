document.addEventListener('DOMContentLoaded', async function() {
    const statsContainer = document.getElementById('statsContainer');
  
    try {
      // Appel à votre API pour récupérer les statistiques
      const response = await axios.get('https://maison-celeste.onrender.com/api/totals'); // Remplacez par votre URL d'API
      const stats = response.data;
  
      // Création des cartes d'information pour chaque statistique
      Object.keys(stats).forEach(key => {
        const infoCard = document.createElement('div');
        infoCard.classList.add('info-card', 'bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden');
  
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('p-4');
  
        const title = document.createElement('h2');
        title.classList.add('text-xl', 'font-bold');
        title.textContent = capitalizeFirstLetter(key.replace('_', ' ')); // Formater le titre en majuscule
  
        const value = document.createElement('p');
        value.classList.add('text-gray-700', 'mt-2');
        value.textContent = stats[key]; // Afficher la valeur de la statistique
  
        contentWrapper.appendChild(title);
        contentWrapper.appendChild(value);
  
        infoCard.appendChild(contentWrapper);
        statsContainer.appendChild(infoCard);
      });
  
      // Données pour le graphique
      const labels = Object.keys(stats);
      const data = Object.values(stats);
  
      // Création du graphique avec Chart.js
      const ctx = document.getElementById('myChart').getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'bar', // Type de graphique (ici barres, mais peut être line, pie, etc.)
        data: {
          labels: labels,
          datasets: [{
            label: 'Statistiques', // Légende du graphique
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)', // Couleur pour chaque barre
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)', // Couleur de la bordure
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true // Axe Y commence à 0
            }
          }
        }
      });
  
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques :', error);
      alert('Erreur lors de la récupération des statistiques.');
    }
  });
  
  // Fonction pour mettre en majuscule la première lettre d'une chaîne de caractères
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  