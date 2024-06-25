document.addEventListener('DOMContentLoaded', async function() {
    const acapelasListContainer = document.getElementById('acapelasList');
  
    try {
      // Récupérer les acapelas depuis l'API
      const response = await fetch('https://maisonccc.onrender.com/api/acapela');
      const acapelas = await response.json();
  
      // Parcourir les résultats et créer les cartes d'acapela
      acapelas.forEach(acapela => {
        const acapelaCard = createAcapelaCard(acapela);
        acapelasListContainer.appendChild(acapelaCard);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des acapelas :', error);
      alert('Erreur lors de la récupération des acapelas.');
    }
  });
  
  // Fonction pour créer une carte d'acapela à partir des données récupérées
  function createAcapelaCard(acapela) {
    const acapelaCard = document.createElement('div');
    acapelaCard.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'p-4', 'mb-4');
  
    const image = document.createElement('img');
    image.classList.add('w-full', 'h-48', 'object-cover', 'mb-4');
    image.src = acapela.photo ? acapela.photo : 'https://via.placeholder.com/400x300';
    image.alt = acapela.titre;
  
    const title = document.createElement('h2');
    title.classList.add('text-xl', 'font-bold', 'mb-2');
    title.textContent = acapela.titre;
  
    const author = document.createElement('p');
    author.classList.add('text-gray-700');
    author.textContent = `Auteur: ${acapela.auteur}`;
  
    const review = document.createElement('p');
    review.classList.add('text-gray-700');
    review.textContent = `Review: ${acapela.review}`;
  
    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.classList.add('w-full', 'px-4', 'pb-4');
    audioPlayer.innerHTML = `<source src="https://maison-celeste.onrender.com/api/firebase/${acapela.lien_audio}" type="audio/mpeg">
                             Your browser does not support the audio element.`;
  
    acapelaCard.appendChild(image);
    acapelaCard.appendChild(title);
    acapelaCard.appendChild(author);
    acapelaCard.appendChild(review);
    acapelaCard.appendChild(audioPlayer);
  
    return acapelaCard;
  }
  