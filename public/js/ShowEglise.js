document.addEventListener('DOMContentLoaded', async function() {
    const eglisesPerPage = 6; // Nombre d'églises par page
    let currentPage = 1; // Page actuelle
  
    // Fonction pour récupérer les églises depuis l'API
    async function fetchEglises(page) {
      try {
        const response = await fetch(`https://maisonccc.onrender.com/api/alleglisesceleste?page=${page}&limit=${eglisesPerPage}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Erreur lors de la récupération des églises:', error);
        throw error; // Propage l'erreur pour être capturée plus haut
      }
    }
  
    // Fonction pour afficher les églises sur la page
    async function displayEglises(page) {
      try {
        const eglises = await fetchEglises(page);
        const eglisesListContainer = document.getElementById('eglisesList');
        eglisesListContainer.innerHTML = ''; // Vide le conteneur avant d'ajouter de nouvelles églises
  
        eglises.forEach(eglise => {
          const egliseCard = createEgliseCard(eglise);
          eglisesListContainer.appendChild(egliseCard);
        });
  
        // Affichage des boutons de pagination
        displayPagination(page);
      } catch (error) {
        console.error('Erreur lors de la récupération ou de l\'affichage des églises:', error);
        alert('Erreur lors de la récupération ou de l\'affichage des églises.');
      }
    }
  
    // Fonction pour créer une carte d'église à partir des données récupérées
    function createEgliseCard(eglise) {
      const egliseCard = document.createElement('div');
      egliseCard.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'p-4', 'mb-4');
  
      const image = document.createElement('img');
      image.classList.add('w-full', 'h-48', 'object-cover', 'mb-4');
      image.src = `https://maisonccc.onrender.com/api/firebase/${eglise.image}`;
      image.alt = eglise.nom;
  
      const title = document.createElement('h2');
      title.classList.add('text-xl', 'font-bold', 'mb-2');
      title.textContent = eglise.nom;
  
      const address = document.createElement('p');
      address.classList.add('text-gray-700');
      address.textContent = eglise.adresse;
  
      egliseCard.appendChild(image);
      egliseCard.appendChild(title);
      egliseCard.appendChild(address);
  
      return egliseCard;
    }
  
    // Fonction pour afficher les boutons de pagination
    function displayPagination(currentPage) {
      const paginationContainer = document.getElementById('pagination');
      paginationContainer.innerHTML = ''; // Vide le conteneur de pagination avant de réafficher
  
      fetchEglisesCount().then(totalEglises => {
        const totalPages = Math.ceil(totalEglises / eglisesPerPage);
  
        for (let i = 1; i <= totalPages; i++) {
          const button = document.createElement('button');
          button.textContent = i;
          button.classList.add(
            'mx-2', 'px-4', 'py-2', 'bg-blue-500', 'text-white', 'font-semibold', 'rounded', 'hover:bg-blue-600'
          );
          if (i === currentPage) {
            button.disabled = true;
            button.classList.remove('hover:bg-blue-600');
            button.classList.add('bg-blue-700', 'cursor-default');
          } else {
            button.addEventListener('click', () => {
              currentPage = i;
              displayEglises(currentPage);
            });
          }
          paginationContainer.appendChild(button);
        }
      }).catch(error => {
        console.error('Erreur lors de la récupération du nombre total d\'églises:', error);
        alert('Erreur lors de la récupération du nombre total d\'églises.');
      });
    }
  
    // Fonction pour récupérer le nombre total d'églises
    async function fetchEglisesCount() {
      try {
        const response = await fetch('https://maisonccc.onrender.com/api/alleglisecleste/count');
        const data = await response.json();
        return data.count;
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre total d\'églises:', error);
        throw error;
      }
    }
  
    // Afficher les églises de la première page au chargement initial
    displayEglises(currentPage);
  });
  