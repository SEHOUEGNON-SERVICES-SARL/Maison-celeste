from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from flask_cors import CORS
import os
import mysql.connector

# Charger les variables d'environnement à partir du fichier .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Active CORS pour toutes les routes de l'application

# Connexion à la base de données MySQL en utilisant les variables d'environnement
db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

cursor = db.cursor()

@app.route('/')
def index():
    return render_template('index.html')


# Endpoint pour insérer un cantique
@app.route('/cantique', methods=['POST'])
def insert_cantique():
    cantique_data = request.json  # Récupère l'objet JSON de la requête
    cantique = cantique_data['cantique']
    categorie_id = cantique_data['categorie_id']  # Supposons que 'categorie_id' est également envoyé dans la requête
    titre = cantique_data['titre']  # Supposons que 'titre' est également envoyé dans la requête

    # Créer une seule chaîne de caractères contenant toutes les lignes du cantique sans les balises <li>
    cantique_texte = '\n'.join(cantique)

    # Insérer le texte du cantique dans la colonne 'line' de la table
    cursor.execute("INSERT INTO cantique (categorie_id, titre, line) VALUES (%s, %s, %s)", (categorie_id, titre, cantique_texte))
    db.commit()
    
    return cantique_texte, 201



# Endpoint pour récupérer le cantique
@app.route('/showcantique', methods=['GET'])
def get_all_cantique():
    cursor.execute("SELECT line FROM cantique")
    cantique = cursor.fetchall()
    cantique_html = "<div class='poem'>\n"
    for line in cantique:
        cantique_html += f"<div class='line'>{line[0]}</div>\n"
    cantique_html += "</div>"
    return cantique_html

@app.route('/getshowcantique/<int:cantique_id>', methods=['GET'])
def get_single_cantique(cantique_id):
    cursor.execute("SELECT id, titre, line FROM cantique WHERE id = %s", (cantique_id,))
    cantique = cursor.fetchone()
    if cantique:
        cantique_details = {
            'id': cantique[0],
            'titre': cantique[1],
            'line': cantique[2].replace('\n', ' ').replace(' ', '')  # Supprimer les sauts de ligne et les espaces
        }
        return jsonify(cantique_details), 200
    else:
        return jsonify(message="Cantique non trouvé"), 404



@app.route('/allcantique', methods=['GET'])
def get_all_cantiques():  # Correction du nom de la fonction
    cursor.execute("SELECT id, titre FROM cantique")
    cantique = cursor.fetchall()
    cantique_list = [{'id': item[0], 'titre': item[1]} for item in cantique]
    return jsonify(cantique_list)


if __name__ == '__main__':
    app.run(debug=True)
