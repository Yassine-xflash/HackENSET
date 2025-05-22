# models/visual_audio_detection.py
import cv2
import numpy as np
import face_recognition
import mediapipe as mp
from ultralytics import YOLO
import os
import math
import random
import speech_recognition as sr
# import pyaudio # Nécessaire pour sr.Microphone, mais pas directement importé ici pour éviter les erreurs d'installation

# --- Initialisation des Modules IA ---
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

# Charger un modèle YOLOv8 pré-entraîné pour la détection d'objets
try:
    yolo_model = YOLO('yolov8n.pt')
    print("Modèle YOLOv8 chargé avec succès pour la détection d'objets.")
except Exception as e:
    print(f"AVERTISSEMENT: Erreur lors du chargement du modèle YOLOv8: {e}. La détection d'objets sera limitée.")
    yolo_model = None

# --- Variables Globales pour le Suivi d'État (simulent un état persistant pour un flux) ---
# Ces variables sont nécessaires pour que les fonctions puissent suivre l'état entre les appels de frame.
# Dans une application réelle (Flask/FastAPI), elles seraient gérées par une session ou un état de service.

# Visuel
_last_head_pose = None
_abnormal_movement_counter = 0

# Audio
_recognizer = sr.Recognizer()
_audio_source = None # Sera initialisé avec sr.Microphone
_unexpected_voice_counter = 0

# --- Paramètres de Détection ---
# Visuel
HEAD_PITCH_THRESHOLD = 20 # Degrés (haut/bas)
HEAD_YAW_THRESHOLD = 20   # Degrés (gauche/droite)
HEAD_ROLL_THRESHOLD = 15  # Degrés (inclinaison latérale)
CONSECUTIVE_FRAMES_THRESHOLD = 5 # Nombre de frames consécutives pour confirmer un mouvement anormal

TARGET_OBJECTS_YOLO = ['cell phone', 'book', 'laptop'] # Classes d'objets à surveiller avec YOLOv8

# Audio
AUDIO_CHUNK_SIZE = 1024 # Taille des échantillons audio
AUDIO_SAMPLE_RATE = 44100 # Fréquence d'échantillonnage (Hz)
UNEXPECTED_VOICE_CONSECUTIVE_ALERTS = 3 # Nombre d'alertes consécutives pour confirmer une voix inattendue

# --- Données d'Enrôlement Simulé pour la Reconnaissance Faciale ---
# En réalité, ces encodages seraient chargés d'une base de données sécurisée.
KNOWN_FACE_ENCODINGS = {} # Dict: {student_id: face_encoding}

def load_known_faces(known_faces_data: dict):
    """
    Charge les encodages faciaux connus (simulés) dans la mémoire.
    known_faces_data: un dictionnaire où les clés sont les student_id et les valeurs sont les chemins d'image.
    """
    for student_id, image_path in known_faces_data.items():
        try:
            image = face_recognition.load_image_file(image_path)
            face_encodings = face_recognition.face_encodings(image)
            if face_encodings:
                KNOWN_FACE_ENCODINGS[student_id] = face_encodings[0]
                print(f"Visage de l'étudiant {student_id} enrôlé.")
            else:
                print(f"Aucun visage détecté dans l'image d'enrôlement pour {student_id}: {image_path}")
        except FileNotFoundError:
            print(f"Erreur: Fichier d'image non trouvé à {image_path} pour {student_id}")
        except Exception as e:
            print(f"Erreur lors de l'enrôlement du visage pour {student_id}: {e}")

# --- Fonctions de Détection Visuelle ---

def verify_identity(frame: np.ndarray, student_id_to_verify: str):
    """
    Vérifie l'identité de la personne dans le cadre par rapport à un ID étudiant.
    :param frame: Le cadre de l'image (np.array).
    :param student_id_to_verify: L'ID de l'étudiant à vérifier.
    :return: (est_verifie: bool, score_confiance: float, message: str)
    """
    known_encoding = KNOWN_FACE_ENCODINGS.get(student_id_to_verify)
    if known_encoding is None:
        return False, 0.0, f"ID étudiant '{student_id_to_verify}' non enrôlé."

    face_locations = face_recognition.face_locations(frame)
    face_encodings = face_recognition.face_encodings(frame, face_locations)

    if not face_encodings:
        return False, 0.0, "Aucun visage détecté pour vérification."

    # Pour MVP, on vérifie le premier visage détecté
    current_face_encoding = face_encodings[0]

    matches = face_recognition.compare_faces([known_encoding], current_face_encoding, tolerance=0.6)
    face_distance = face_recognition.face_distance([known_encoding], current_face_encoding)[0]
    confidence_score = 1.0 - face_distance

    if matches[0]:
        return True, confidence_score, f"Identité confirmée pour {student_id_to_verify}."
    else:
        return False, confidence_score, "Identité non confirmée."

def get_head_pose(face_landmarks, image_width, image_height):
    """
    Estime la pose de la tête (pitch, yaw, roll) à partir des landmarks du visage.
    :param face_landmarks: Objets landmarks de MediaPipe.
    :param image_width: Largeur de l'image.
    :param image_height: Hauteur de l'image.
    :return: (pitch, yaw, roll) en degrés.
    """
    image_points = np.array([
        (face_landmarks.landmark[1].x * image_width, face_landmarks.landmark[1].y * image_height),
        (face_landmarks.landmark[33].x * image_width, face_landmarks.landmark[33].y * image_height),
        (face_landmarks.landmark[263].x * image_width, face_landmarks.landmark[263].y * image_height),
        (face_landmarks.landmark[61].x * image_width, face_landmarks.landmark[61].y * image_height),
        (face_landmarks.landmark[291].x * image_width, face_landmarks.landmark[291].y * image_height),
        (face_landmarks.landmark[199].x * image_width, face_landmarks.landmark[199].y * image_height)
    ], dtype="double")

    model_points = np.array([
        (0.0, 0.0, 0.0),
        (-225.0, 170.0, -135.0),
        (225.0, 170.0, -135.0),
        (-150.0, -150.0, -125.0),
        (150.0, -150.0, -125.0),
        (0.0, -330.0, -65.0)
    ])

    focal_length = image_width
    center = (image_width/2, image_height/2)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]
    ], dtype="double")

    dist_coeffs = np.zeros((4,1))

    (success, rotation_vector, translation_vector) = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)

    rmat, jac = cv2.Rodrigues(rotation_vector)

    sy = math.sqrt(rmat[0,0] * rmat[0,0] + rmat[1,0] * rmat[1,0])
    singular = sy < 1e-6

    if not singular:
        x = math.atan2(rmat[2,1], rmat[2,2])
        y = math.atan2(-rmat[2,0], sy)
        z = math.atan2(rmat[1,0], rmat[0,0])
    else:
        x = math.atan2(-rmat[1,2], rmat[1,1])
        y = math.atan2(-rmat[2,0], sy)
        z = 0

    pitch = math.degrees(x)
    yaw = math.degrees(y)
    roll = math.degrees(z)

    return pitch, yaw, roll

def analyze_head_movement(frame: np.ndarray):
    """
    Analyse les mouvements de la tête pour détecter des comportements anormaux.
    :param frame: Le cadre de l'image (np.array).
    :return: (is_abnormal: bool, message: str, current_pose: dict)
    """
    global _last_head_pose, _abnormal_movement_counter

    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    with mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5, min_tracking_confidence=0.5) as face_mesh_detector:
        results = face_mesh_detector.process(image_rgb)

    if not results.multi_face_landmarks:
        _abnormal_movement_counter = 0
        return False, "Aucun visage détecté pour le suivi de la tête.", {}

    face_landmarks = results.multi_face_landmarks[0]
    h, w, _ = frame.shape
    pitch, yaw, roll = get_head_pose(face_landmarks, w, h)

    current_head_pose = {'pitch': pitch, 'yaw': yaw, 'roll': roll}

    is_abnormal = False
    message = "Mouvement normal."

    if _last_head_pose:
        if abs(yaw) > HEAD_YAW_THRESHOLD:
            is_abnormal = True
            message = f"Tête tournée sur le côté (Yaw: {yaw:.1f} deg)."
        elif abs(pitch) > HEAD_PITCH_THRESHOLD:
            is_abnormal = True
            message = f"Tête inclinée (Pitch: {pitch:.1f} deg)."
        elif abs(roll) > HEAD_ROLL_THRESHOLD:
            is_abnormal = True
            message = f"Tête inclinée latéralement (Roll: {roll:.1f} deg)."

        if is_abnormal:
            _abnormal_movement_counter += 1
            if _abnormal_movement_counter >= CONSECUTIVE_FRAMES_THRESHOLD:
                message = f"ALERTE : Mouvement anormal prolongé détecté ({message})."
            else:
                message = f"Mouvement anormal détecté ({message}). Compteur: {_abnormal_movement_counter}/{CONSECUTIVE_FRAMES_THRESHOLD}"
        else:
            _abnormal_movement_counter = 0
    else:
        message = "Initialisation du suivi de la tête."

    _last_head_pose = current_head_pose
    return is_abnormal, message, current_head_pose

def detect_multiple_faces(frame: np.ndarray):
    """
    Détecte la présence de plusieurs visages dans le cadre.
    :param frame: Le cadre de l'image (np.array).
    :return: (is_multiple_faces: bool, message: str, num_faces: int)
    """
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    with mp_face_detection.FaceDetection(min_detection_confidence=0.7) as face_detector:
        results = face_detector.process(image_rgb)

    num_faces = 0
    if results.detections:
        num_faces = len(results.detections)

    is_multiple_faces = num_faces > 1
    message = f"{num_faces} visage(s) détecté(s)."
    if is_multiple_faces:
        message = f"ALERTE : Plusieurs visages détectés ({num_faces})."

    return is_multiple_faces, message, num_faces

def detect_specific_objects(frame: np.ndarray):
    """
    Détecte la présence de téléphones ou de papiers dans le cadre.
    :param frame: Le cadre de l'image (np.array).
    :return: (is_suspect: bool, message: str, detected_objects_list: list)
    """
    detected_objects = []
    is_phone_detected = False
    is_paper_detected = False

    if yolo_model is not None:
        results = yolo_model(frame, verbose=False)
        for r in results:
            for c in r.boxes.cls:
                class_name = yolo_model.names[int(c)]
                if class_name in TARGET_OBJECTS_YOLO:
                    detected_objects.append(class_name)
                    if class_name == 'cell phone':
                        is_phone_detected = True

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        area = cv2.contourArea(contour)
        if area > (frame.shape[0] * frame.shape[1] * 0.05):
            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(approx)
                aspect_ratio = float(w)/h
                if 0.5 < aspect_ratio < 2.0:
                    is_paper_detected = True
                    if "paper (heuristic)" not in detected_objects:
                        detected_objects.append("paper (heuristic)")
                    break

    message = "Aucun objet suspect détecté."
    if is_phone_detected and is_paper_detected:
        message = "ALERTE : Téléphone et papier détectés."
    elif is_phone_detected:
        message = "ALERTE : Téléphone détecté."
    elif is_paper_detected:
        message = "ALERTE : Papier suspect détecté (heuristique)."
    elif detected_objects:
        message = f"Objets détectés: {', '.join(detected_objects)}."

    return is_phone_detected or is_paper_detected, message, detected_objects

# --- Fonctions de Détection Audio ---

def init_audio_source():
    """
    Initialise la source audio (microphone).
    Doit être appelé une seule fois au début de la session d'examen.
    """
    global _audio_source
    if _audio_source is None:
        try:
            _audio_source = sr.Microphone(sample_rate=AUDIO_SAMPLE_RATE, chunk_size=AUDIO_CHUNK_SIZE)
            with _audio_source as source:
                print("Ajustement pour le bruit ambiant, veuillez patienter...")
                _recognizer.adjust_for_ambient_noise(source, duration=1)
                print("Ajustement terminé.")
        except Exception as e:
            _audio_source = None
            print(f"Erreur lors de l'initialisation du microphone: {e}. La détection vocale sera simulée.")

def analyze_audio_stream(audio_data_chunk=None):
    """
    Analyse un chunk de données audio pour détecter la présence de voix.
    :param audio_data_chunk: Un objet sr.AudioData (si l'audio vient du frontend) ou None (pour utiliser le microphone).
    :return: (is_voice_detected: bool, message: str)
    """
    global _unexpected_voice_counter

    is_voice_detected = False
    message = "Aucune activité vocale."

    if _audio_source is None and audio_data_chunk is None:
        # Simuler la détection si le micro n'est pas dispo et pas de chunk fourni
        if random.random() < 0.05: # 5% de chance de simuler une voix inattendue
            is_voice_detected = True
            message = "Voix inattendue simulée."
        else:
            is_voice_detected = False
            message = "Aucune activité vocale simulée."
        return is_voice_detected, message

    try:
        if audio_data_chunk:
            audio_segment = audio_data_chunk
        else:
            with _audio_source as source:
                audio_segment = _recognizer.listen(source, phrase_time_limit=2, timeout=1)

        _recognizer.recognize_google(audio_segment, language="fr-FR")
        is_voice_detected = True
        message = "Activité vocale détectée."

    except sr.UnknownValueError:
        is_voice_detected = False
        message = "Aucune activité vocale claire."
    except sr.RequestError as e:
        print(f"Erreur du service de reconnaissance vocale; {e}")
        is_voice_detected = False
        message = "Erreur de service vocal."
    except Exception as e:
        print(f"Erreur de capture/traitement audio: {e}")
        is_voice_detected = False
        message = "Erreur audio."

    if is_voice_detected:
        _unexpected_voice_counter += 1
        if _unexpected_voice_counter >= UNEXPECTED_VOICE_CONSECUTIVE_ALERTS:
            message = f"ALERTE : Voix inattendue détectée ({message})."
        else:
            message = f"Voix inattendue détectée. Compteur: {_unexpected_voice_counter}/{UNEXPECTED_VOICE_CONSECUTIVE_ALERTS}"
    else:
        _unexpected_voice_counter = 0

    return is_voice_detected, message

# --- Fonction Globale de Traitement de Données en Temps Réel ---

def process_realtime_data(frame: np.ndarray, student_id_to_verify: str, audio_data_chunk=None):
    """
    Traite un cadre de webcam et un chunk audio pour toutes les détections.
    :param frame: Le cadre de l'image (np.array).
    :param student_id_to_verify: L'ID de l'étudiant dont l'identité doit être vérifiée.
    :param audio_data_chunk: Un objet sr.AudioData (si l'audio vient du frontend) ou None.
    :return: Un dictionnaire avec tous les résultats de détection.
    """
    results = {
        "identity_verified": False,
        "identity_score": 0.0,
        "identity_message": "Non vérifié.",
        "abnormal_movement_detected": False,
        "movement_message": "Normal.",
        "head_pose": {},
        "multiple_faces_detected": False,
        "multiple_faces_count": 0,
        "multiple_faces_message": "Aucun autre visage.",
        "suspect_objects_detected": False,
        "objects_message": "Aucun objet suspect.",
        "detected_object_list": [],
        "unexpected_voice_detected": False,
        "voice_message": "Aucune activité vocale.",
        "overall_alert": False, # Indique si une alerte majeure a été déclenchée
        "overall_alert_message": "Surveillance active. Aucun problème détecté."
    }

    # 1. Vérification d'identité
    is_verified, score, msg = verify_identity(frame, student_id_to_verify)
    results["identity_verified"] = is_verified
    results["identity_score"] = score
    results["identity_message"] = msg
    if not is_verified:
        results["overall_alert"] = True

    # 2. Analyse des mouvements de la tête
    is_abnormal_move, move_msg, pose = analyze_head_movement(frame)
    results["abnormal_movement_detected"] = is_abnormal_move
    results["movement_message"] = move_msg
    results["head_pose"] = pose
    if is_abnormal_move and _abnormal_movement_counter >= CONSECUTIVE_FRAMES_THRESHOLD:
        results["overall_alert"] = True

    # 3. Détection de plusieurs visages
    is_multiple, multi_msg, count = detect_multiple_faces(frame)
    results["multiple_faces_detected"] = is_multiple
    results["multiple_faces_count"] = count
    results["multiple_faces_message"] = multi_msg
    if is_multiple:
        results["overall_alert"] = True

    # 4. Détection d'objets (téléphone, papier)
    is_objects_detected, objects_msg, object_list = detect_specific_objects(frame)
    results["suspect_objects_detected"] = is_objects_detected
    results["objects_message"] = objects_msg
    results["detected_object_list"] = object_list
    if is_objects_detected:
        results["overall_alert"] = True

    # 5. Analyse audio
    is_voice, voice_msg = analyze_audio_stream(audio_data_chunk)
    results["unexpected_voice_detected"] = is_voice
    results["voice_message"] = voice_msg
    if is_voice and _unexpected_voice_counter >= UNEXPECTED_VOICE_CONSECUTIVE_ALERTS:
        results["overall_alert"] = True

    # Combinaison d'alertes (ex: autre visage + voix inattendue = alerte forte)
    if results["multiple_faces_detected"] and results["unexpected_voice_detected"]:
        results["overall_alert"] = True
        results["overall_alert_message"] = "ALERTE COMBINÉE : Autre personne et voix inattendue détectées !"
    elif results["overall_alert"]:
        results["overall_alert_message"] = "ALERTE : Comportement suspect détecté."
    else:
        results["overall_alert_message"] = "Surveillance active. Aucun problème détecté."

    return results

def reset_visual_module_state():
    """
    Réinitialise les variables d'état globales du module visuel et audio.
    À appeler au début d'un nouvel examen ou d'une nouvelle session.
    """
    global _last_head_pose, _abnormal_movement_counter, _unexpected_voice_counter
    _last_head_pose = None
    _abnormal_movement_counter = 0
    _unexpected_voice_counter = 0
    print("État du module visuel et audio réinitialisé.")