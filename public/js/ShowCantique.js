document.addEventListener('DOMContentLoaded', async function() {
    try {
      const response = await axios.get('http://localhost:3000/api/allcantiques');
      const cantiques = response.data;

      const cantiquesListContainer = document.getElementById('cantiquesList');

      cantiques.forEach(cantique => {
        const cantiqueCard = document.createElement('div');
        cantiqueCard.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden');

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('p-4');

        const title = document.createElement('h2');
        title.classList.add('text-xl', 'font-bold');
        title.textContent = cantique.titre;

        const description = document.createElement('p');
        description.classList.add('text-gray-700', 'mt-2');
        description.textContent = truncateText(cantique.text, 45); // Limite à 45 mots

        const audioPlayer = document.createElement('audio');
        audioPlayer.controls = true;
        audioPlayer.classList.add('w-full', 'px-4', 'pb-4');
        audioPlayer.innerHTML = `<source src="http://localhost:3000/api/firebase/${cantique.audio_path}" type="audio/mpeg">
                                 Your browser does not support the audio element.`;

        contentWrapper.appendChild(title);
        contentWrapper.appendChild(description);

        cantiqueCard.appendChild(contentWrapper);
        cantiqueCard.appendChild(audioPlayer);

        cantiquesListContainer.appendChild(cantiqueCard);
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des cantiques:', error);
      alert('Erreur lors de la récupération des cantiques.');
    }
  });

  function truncateText(text, maxLength) {
    const words = text.split(' ');
    if (words.length > maxLength) {
      return words.slice(0, maxLength).join(' ') + '...';
    } else {
      return text;
    }
  } 