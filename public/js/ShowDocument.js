// Fonction pour récupérer et afficher les informations des documents célestes
async function fetchAndDisplayDocuments() {
    try {
        const response = await fetch('http://localhost:3000/api/showdocuments');
        const data = await response.json();

        // Sélectionner l'élément HTML où les informations seront affichées
        const documentsContainer = document.getElementById('documents-list');

        // Parcourir les données des documents et les afficher dans la liste
        data.forEach(document => {
            const documentElement = document.createElement('div');
            documentElement.className = 'bg-white p-6 rounded-lg shadow-md';
            documentElement.innerHTML = `
                <h2 class="text-xl font-bold mb-2">${document.titre}</h2>
                <p class="text-gray-700 mb-4">${document.description}</p>
                <a href="http://localhost:3000/api/firebase/${document.fichier}" 
                    class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Télécharger</a>
            `;
            documentsContainer.appendChild(documentElement);
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        // Afficher un message d'erreur à l'utilisateur
    }
}

// Appeler la fonction pour récupérer et afficher les documents lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayDocuments();
});