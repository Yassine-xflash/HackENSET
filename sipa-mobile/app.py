import os
import base64
import numpy as np
import cv2
import sqlite3
import json
from datetime import datetime

from flask import Flask, request, jsonify, render_template, url_for, redirect

# Importation de vos modules d'IA
from models import text_detection
from models import visual_audio_detection
from models import proactive_assistant

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_super_secret_key_for_hackathon' # Change this for production!

# --- Initialisation des Modules d'IA au démarrage de l'application ---
# Chemin pour l'image d'enrôlement facial (doit exister dans static/img/)
KNOWN_STUDENT_FACE_PATH = os.path.join(app.root_path, 'static', 'img', 'known_student_face.jpg')
KNOWN_STUDENT_ID = "student_A_123" # ID de l'étudiant pour la démo

# Charger le visage connu pour la reconnaissance faciale
visual_audio_detection.load_known_faces({KNOWN_STUDENT_ID: KNOWN_STUDENT_FACE_PATH})

# Initialiser la source audio (microphone) une seule fois
visual_audio_detection.init_audio_source()
print("SIPA Backend prêt et modules chargés.")

# --- Configuration de la Base de Données SQLite pour les Logs ---
DATABASE = 'sipa_logs.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row # Permet d'accéder aux colonnes par leur nom
    return conn

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                type TEXT NOT NULL, -- 'text' ou 'visual_audio'
                alert_level TEXT, -- 'low', 'medium', 'high'
                message TEXT,
                details TEXT, -- JSON string of detailed results
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
    print("Base de données SQLite initialisée.")

# Appeler l'initialisation de la DB au démarrage de l'app
with app.app_context():
    init_db()

# --- Routes de l'Application ---

@app.route('/')
def index():
    """Page d'accueil de l'application SIPA."""
    return render_template('index.html')

@app.route('/student')
def student_dashboard():
    """Tableau de bord de l'étudiant avec soumission de texte, examen vidéo/audio et chatbot."""
    return render_template('student_dashboard.html', student_id=KNOWN_STUDENT_ID)

@app.route('/educator')
def educator_dashboard():
    """Tableau de bord de l'éducateur affichant les alertes de détection."""
    return render_template('educator_dashboard.html')

# --- API Endpoints ---

@app.route('/api/detect/text', methods=['POST'])
def api_detect_text():
    """
    Endpoint API pour la détection de plagiat et de contenu généré par IA.
    Reçoit le texte de la soumission.
    """
    data = request.json
    text_content = data.get('text', '')
    student_id = data.get('student_id', 'unknown')

    if not text_content:
        return jsonify({"error": "No text content provided."}), 400

    # Appeler les fonctions de détection textuelle
    plagiarism_result = text_detection.detect_plagiarism(text_content)
    ai_content_result = text_detection.detect_ai_content(text_content)

    # Déterminer le niveau d'alerte global pour le log
    alert_level = 'low'
    if plagiarism_result['score'] > 0.7 or ai_content_result['score'] > 0.7:
        alert_level = 'high'
    elif plagiarism_result['score'] > 0.4 or ai_content_result['score'] > 0.4:
        alert_level = 'medium'

    # Préparer les détails pour le log
    details = {
        "plagiarism": plagiarism_result,
        "ai_content": ai_content_result
    }
    message = f"Détection textuelle: Plagiat={plagiarism_result['score']:.2f}, IA={ai_content_result['score']:.2f}"

    # Enregistrer la détection dans la base de données
    with get_db_connection() as conn:
        conn.execute(
            "INSERT INTO detections (student_id, type, alert_level, message, details) VALUES (?, ?, ?, ?, ?)",
            (student_id, 'text', alert_level, message, json.dumps(details))
        )
        conn.commit()

    return jsonify({
        "plagiarism_score": plagiarism_result['score'],
        "plagiarism_flags": plagiarism_result['flags'],
        "ai_content_score": ai_content_result['score'],
        "alert_level": alert_level,
        "message": message
    })

@app.route('/api/detect/realtime', methods=['POST'])
def api_detect_realtime():
    """
    Endpoint API pour le traitement en temps réel des frames vidéo et des chunks audio.
    Reçoit une frame vidéo encodée en base64 et un chunk audio encodé en base64 (optionnel).
    """
    data = request.json
    image_base64 = data.get('image', '')
    audio_base64 = data.get('audio', None) # Peut être null si seul la vidéo est envoyée
    student_id = data.get('student_id', 'unknown')

    if not image_base64:
        return jsonify({"error": "No image data provided."}), 400

    # Décoder l'image base64 en tableau numpy OpenCV
    try:
        nparr = np.frombuffer(base64.b64decode(image_base64), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image.")
    except Exception as e:
        return jsonify({"error": f"Invalid image data: {e}"}), 400

    # Décoder le chunk audio si fourni
    audio_data_chunk = None
    if audio_base64:
        try:
            # SpeechRecognition.AudioData attend (binary_data, sample_rate, sample_width)
            # Assurez-vous que le frontend envoie le bon format (ex: 16-bit PCM)
            audio_bytes = base64.b64decode(audio_base64)
            audio_data_chunk = visual_audio_detection._recognizer.AudioData(
                audio_bytes,
                visual_audio_detection.AUDIO_SAMPLE_RATE,
                2 # Sample width for 16-bit audio
            )
        except Exception as e:
            print(f"AVERTISSEMENT: Erreur lors du décodage du chunk audio: {e}")
            # Continuer sans audio si erreur

    # Appeler la fonction de traitement globale du module visuel/audio
    results = visual_audio_detection.process_realtime_data(frame, student_id, audio_data_chunk)

    # Déterminer le niveau d'alerte pour le log
    alert_level = 'low'
    if results['overall_alert']:
        if results['identity_verified'] == False or results['multiple_faces_detected'] or results['suspect_objects_detected'] or (results['unexpected_voice_detected'] and visual_audio_detection._unexpected_voice_counter >= visual_audio_detection.UNEXPECTED_VOICE_CONSECUTIVE_ALERTS):
            alert_level = 'high'
        else:
            alert_level = 'medium'

    # Enregistrer la détection dans la base de données si une alerte est déclenchée
    if results['overall_alert']:
        with get_db_connection() as conn:
            conn.execute(
                "INSERT INTO detections (student_id, type, alert_level, message, details) VALUES (?, ?, ?, ?, ?)",
                (student_id, 'visual_audio', alert_level, results['overall_alert_message'], json.dumps(results))
            )
            conn.commit()

    return jsonify(results)

@app.route('/api/proactive/ask', methods=['POST'])
def api_proactive_ask():
    """
    Endpoint API pour le chatbot de l'assistant proactif.
    """
    data = request.json
    question = data.get('question', '')
    context = data.get('context', None) # Contexte de la question (ex: 'plagiarism_flagged')

    if not question:
        return jsonify({"error": "No question provided."}), 400

    response_text, recommended_module = proactive_assistant.get_proactive_response(question, context)
    return jsonify({"answer": response_text, "recommended_module": recommended_module})

@app.route('/api/educator/alerts', methods=['GET'])
def api_educator_alerts():
    """
    Endpoint API pour récupérer les alertes de détection pour le tableau de bord éducateur.
    """
    with get_db_connection() as conn:
        # Récupérer les 50 dernières alertes, triées par timestamp descendant
        alerts = conn.execute("SELECT * FROM detections ORDER BY timestamp DESC LIMIT 50").fetchall()
        # Convertir les lignes SQLite en dictionnaires pour jsonify
        alerts_list = [dict(row) for row in alerts]
        # Désérialiser la colonne 'details' qui est un JSON string
        for alert in alerts_list:
            alert['details'] = json.loads(alert['details'])
    return jsonify(alerts_list)

@app.route('/api/reset_visual_audio_state', methods=['POST'])
def api_reset_visual_audio_state():
    """
    Endpoint API pour réinitialiser l'état du module visuel/audio.
    À appeler au début d'un nouvel examen pour réinitialiser les compteurs.
    """
    visual_audio_detection.reset_visual_module_state()
    return jsonify({"status": "Visual and audio module state reset successfully."})


if __name__ == '__main__':
    # Créer le dossier static/img si non existant et y placer une image placeholder
    img_dir = os.path.join(app.root_path, 'static', 'img')
    os.makedirs(img_dir, exist_ok=True)
    if not os.path.exists(KNOWN_STUDENT_FACE_PATH):
        dummy_image = np.zeros((200, 200, 3), dtype=np.uint8)
        cv2.putText(dummy_image, "STUDENT FACE", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.imwrite(KNOWN_STUDENT_FACE_PATH, dummy_image)
        print(f"Création d'une image placeholder pour l'enrôlement : {KNOWN_STUDENT_FACE_PATH}")

    app.run(debug=True, host='0.0.0.0', port=5000) # Host 0.0.0.0 pour accès depuis d'autres machines si besoin
