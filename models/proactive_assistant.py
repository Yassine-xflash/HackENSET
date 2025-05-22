# models/proactive_assistant.py
import random

# Base de connaissances simple pour le chatbot
QA_DATA = [
    {"keywords": ["plagiat", "définition", "c'est quoi"], "response": "Le plagiat est l'utilisation des idées ou des mots d'une autre personne sans lui donner le crédit approprié. C'est une faute académique grave.", "module": "module_plagiat_bases"},
    {"keywords": ["citer", "référence", "bibliographie"], "response": "Pour citer correctement, vous devez indiquer la source de toutes les informations qui ne sont pas de vous. Utilisez un style de citation (APA, MLA, Chicago) et incluez une bibliographie.", "module": "module_citation_guide"},
    {"keywords": ["paraphraser", "reformuler"], "response": "Paraphraser, c'est réécrire les idées d'une autre personne avec vos propres mots tout en conservant le sens original et en citant la source. Ce n'est pas juste changer quelques mots.", "module": "module_paraphrase_tips"},
    {"keywords": ["tricher", "examen", "fraude"], "response": "La triche aux examens inclut l'utilisation de notes non autorisées, la copie, ou l'obtention d'aide externe. Cela compromet l'équité de l'évaluation.", "module": "module_exam_integrity"},
    {"keywords": ["stress", "anxiété", "peur"], "response": "Le stress en examen est normal. Concentrez-vous sur votre préparation et respirez profondément. Si vous avez besoin d'aide, parlez-en à vos professeurs ou aux services de soutien de l'université.", "module": "module_stress_management"},
    {"keywords": ["aide", "question", "comprendre"], "response": "Je suis là pour vous aider à comprendre les principes de l'intégrité académique. Posez-moi une question spécifique !", "module": None}
]

def get_proactive_response(question: str, context: str = None):
    """
    Fournit une réponse du chatbot basée sur la question et le contexte.
    :param question: La question posée par l'étudiant.
    :param context: Contexte de la question (ex: 'plagiarism_flagged', 'movement_alert').
    :return: (response_text: str, recommended_module: str)
    """
    question_lower = question.lower()
    
    # Réponses basées sur le contexte (si une alerte a été déclenchée)
    if context == 'plagiarism_flagged':
        return "Il semble qu'une section de votre texte présente des similitudes. Rappelez-vous l'importance de paraphraser et de citer correctement. Consultez notre module sur les citations pour plus d'aide.", "module_citation_guide"
    elif context == 'ai_flagged':
        return "Votre texte montre des caractéristiques de contenu généré par IA. Assurez-vous que votre travail est entièrement original et reflète votre propre pensée. Le module 'Originalité et IA' peut vous aider.", "module_originality_ai"
    elif context == 'visual_alert':
        return "Des comportements inhabituels ont été détectés pendant votre examen. Il est crucial de rester concentré et de ne pas consulter de sources externes. Le module 'Intégrité en Examen' peut vous être utile.", "module_exam_integrity"
    elif context == 'audio_alert':
        return "Une activité vocale inattendue a été détectée. Veuillez vous assurer que vous êtes seul et que l'environnement est calme pendant l'examen. Le module 'Environnement d'Examen' vous guidera.", "module_exam_environment"

    # Réponses basées sur les mots-clés de la question
    for item in QA_DATA:
        for keyword in item["keywords"]:
            if keyword in question_lower:
                return item["response"], item["module"]
    
    # Réponse générique si aucune correspondance
    return "Je ne suis pas sûr de comprendre votre question. Pouvez-vous reformuler ou poser une question plus spécifique sur l'intégrité académique ?", None