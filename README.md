# SIPA - Système Intelligent de Préservation de l'Intégrité Académique (MVP Hackathon)

Ce projet est un prototype développé pour le "Hackathon IA Vigilante 2025". Il vise à démontrer une solution intégrée pour la détection et la prévention de la fraude académique, en combinant l'analyse textuelle, la surveillance visuelle en temps réel (reconnaissance faciale, mouvements, objets) et la détection d'activité vocale inattendue, le tout soutenu par un assistant proactif et pédagogique.

## Fonctionnalités du MVP

* **Analyse de Soumission Textuelle :** Détection simulée de plagiat sémantique et de contenu généré par IA.
* **Simulation d'Examen en Temps Réel :**
    * **Reconnaissance Faciale :** Vérification simulée de l'identité de l'étudiant via la webcam.
    * **Suivi des Mouvements de la Tête :** Détection simulée de mouvements anormaux (regards sur le côté, etc.).
    * **Détection de Visages Multiples :** Alerte si une autre personne apparaît dans le cadre.
    * **Détection d'Objets Suspects :** Alerte si un téléphone ou un papier est détecté.
    * **Détection de Voix Externe :** Alerte si une activité vocale inattendue est détectée via le microphone.
    * **Note Importante :** Pour l'MVP, les modèles d'IA sont simplifiés/simulés. Aucune vidéo ou audio n'est enregistrée.
* **Assistant Proactif (Chatbot) :** Un chatbot basé sur des règles simples pour répondre aux questions sur l'intégrité académique et fournir des conseils contextuels post-détection.
* **Tableau de Bord Éducateur :** Affiche les alertes de détection loguées (textuelles et visuelles/audio) pour une vue d'ensemble.
* **Base de Données Simple :** Utilise SQLite pour stocker les logs de détection.

## Installation et Lancement

Suivez ces étapes pour configurer et lancer l'application localement :

1.  **Cloner le dépôt :**
    ```bash
    git clone https://github.com/Yassine-xflash/HackENSET.git
    cd HackENSET
    ```

2.  **Créer un environnement virtuel et installer les dépendances :**
    Il est fortement recommandé d'utiliser un environnement virtuel pour isoler les dépendances.
    ```bash
    python -m venv venv
    source venv/bin/activate   # Sur Windows : `venv\Scripts\activate`
    pip install -r requirements.txt
    ```
    *Note : L'installation de `dlib` et `PyAudio` peut nécessiter des outils de compilation système. Référez-vous à leur documentation officielle si vous rencontrez des erreurs.*

3.  **Préparer l'image d'enrôlement facial :**
    Créez un dossier `static/img/` à la racine de `HackENSET/` si ce n'est pas déjà fait.
    Placez une image de visage claire nommée `known_student_face.jpg` dans ce dossier. Cette image sera utilisée pour simuler l'enrôlement de l'étudiant de démonstration. Si vous ne placez pas d'image, une image placeholder sera générée au démarrage.

4.  **Lancer l'application Flask :**
    ```bash
    python app.py
    ```
    Le serveur devrait démarrer et être accessible à l'adresse `http://127.0.0.1:5000/` (ou `http://localhost:5000/`).

## Utilisation de l'Application

* **Page d'Accueil (`/`) :** Choisissez d'accéder au portail Étudiant ou Éducateur.
* **Portail Étudiant (`/student`) :**
    * **Analyse Textuelle :** Collez du texte et cliquez sur "Analyser le Devoir". Les résultats (plagiat, IA) s'afficheront.
    * **Simulation d'Examen :** Cliquez sur "Démarrer l'Examen". Accordez les permissions pour la webcam et le microphone. Le système affichera des alertes en temps réel. Cliquez sur "Arrêter l'Examen" pour mettre fin à la simulation.
    * **Assistant Proactif :** Interagissez avec le chatbot pour poser des questions sur l'intégrité académique.
* **Tableau de Bord Éducateur (`/educator`) :**
    * Visualisez les alertes de détection (textuelles et visuelles/audio) qui ont été loguées. La page se met à jour automatiquement.

## Considérations Éthiques (pour le Hackathon)

Ce prototype met en avant l'importance des considérations éthiques :
* **Transparence :** L'utilisateur est informé que la vidéo/audio n'est pas enregistrée.
* **Non-Stockage des Données Brutes :** Seules les métadonnées de détection sont loguées.
* **Faux Positifs :** Le système est un "indicateur" d'alerte, nécessitant une révision humaine.
* **Éducation :** L'assistant proactif vise à éduquer plutôt qu'à simplement punir.

## Limitations du MVP

* Les modèles d'IA sont simplifiés ou utilisent des bibliothèques pré-entraînées avec des logiques de détection basiques. Ils ne sont pas entraînés sur des datasets spécifiques à la fraude académique.
* L'intégration audio/vidéo en temps réel via HTTP POST est une simplification. Pour une solution robuste, des WebSockets seraient préférables.
* La gestion des utilisateurs et l'authentification sont absentes.
* La base de données SQLite est simple et ne gère pas la concurrence pour un déploiement à grande échelle.

Ce projet est une preuve de concept pour le Hackathon IA Vigilante, démontrant une approche holistique et éthique de la préservation de l'intégrité académique.
