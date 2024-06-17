-- Table pour les catégories
CREATE TABLE categorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL
);

-- Table pour les cantiques
CREATE TABLE cantique (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT,
    titre VARCHAR(255) NOT NULL,
    text TEXT,  -- Ajout de la colonne 'line'
    FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);

-- Table pour les acapelas
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    tel VARCHAR(20) NOT NULL,
    profession VARCHAR(255) NOT NULL,
    code_otp VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    review_count INT DEFAULT 0 -- Ajout de la colonne review_count
);

CREATE TABLE acapela (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    categorie_id INT,
    titre VARCHAR(255) NOT NULL,
    lien_audio VARCHAR(255) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    review TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);


-- Table pour les commentaires des acapelas
CREATE TABLE commentaire_acapela (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acapela_id INT,
    commentaire TEXT NOT NULL,
    FOREIGN KEY (acapela_id) REFERENCES acapela(id)
);


-- Table pour les documents célestes
CREATE TABLE document_celeste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    fichier VARCHAR(255) NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);

-- Table pour les animations
CREATE TABLE animation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    lien_video VARCHAR(255) NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);

-- Table pour les formations professionnelles
CREATE TABLE formation_pro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    lien_formation VARCHAR(255) NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);

-- Table pour les églises célestes avec des images
CREATE TABLE eglise_celeste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    image VARCHAR(255) NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);
