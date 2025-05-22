# models/text_detection.py
import random
import re

def detect_plagiarism(text: str):
    """
    Simule la détection de plagiat sémantique.
    Pour MVP, simule un score et quelques drapeaux basés sur la longueur ou des mots-clés.
    """
    score = random.uniform(0.0, 0.9) # Score de plagiat simulé
    flags = []

    if len(text) > 200 and random.random() < 0.3: # Simulation: 30% de chance d'un long texte plagié
        flags.append("Longue section avec forte similarité conceptuelle détectée.")
        score = max(score, random.uniform(0.5, 0.95))
    if re.search(r'\b(copy|paste|source externe)\b', text, re.IGNORECASE):
        flags.append("Mots-clés suspects de plagiat trouvés.")
        score = max(score, random.uniform(0.6, 0.8))

    return {"score": score, "flags": flags}

def detect_ai_content(text: str):
    """
    Simule la détection de contenu généré par IA.
    Pour MVP, simule un score basé sur la présence de phrases types d'IA.
    """
    score = random.uniform(0.0, 0.9) # Score IA simulé
    ai_phrases = [
        "En tant que grand modèle linguistique",
        "Je suis un modèle de langage entraîné par Google",
        "Je n'ai pas d'expériences personnelles",
        "Mon objectif est de vous aider",
        "Je suis un programme informatique"
    ]

    for phrase in ai_phrases:
        if phrase.lower() in text.lower():
            score = max(score, random.uniform(0.7, 0.99)) # Score élevé si phrase IA détectée
            break

    return {"score": score}