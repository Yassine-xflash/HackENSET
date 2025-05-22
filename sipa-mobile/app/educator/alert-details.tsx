import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Text, Card, Chip, Button, Divider, Dialog, Portal, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function AlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Mock data - In a real app, this would come from an API
  const alertDetails: AlertDetail = {
    id: id || '1',
    studentId: 'student_A_123',
    studentName: 'Étudiant A',
    type: 'textual',
    alertLevel: 'high',
    summary: 'Forte probabilité de plagiat (85%) détectée dans une soumission.',
    timestamp: new Date('2025-05-21T14:32:00'),
    course: 'Introduction à la Programmation',
    assignment: 'Devoir #3 - Algorithmes',
    details: {
      plagiarismScore: 0.85,
      aiGeneratedScore: 0.30,
      perplexityScore: 22.5,
      slymentringScore: 0.75,
    },
    textExcerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.',
    screenshots: [],
    status: 'pending',
  };

  const isTextualAlert = alertDetails.type === 'textual';
  const isExamAlert = alertDetails.type === 'exam';

  const handleMarkResolved = () => {
    // In a real app, this would make an API call
    alert('Alerte marquée comme résolue');
    router.back();
  };

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      alert('Veuillez entrer un message de retour');
      return;
    }

    // In a real app, this would make an API call
    alert('Feedback envoyé à l\'étudiant');
    setShowFeedbackDialog(false);
  };

  const getAlertLevelStyle = (level: string) => {
    switch (level) {
      case 'high':
        return styles.highAlert;
      case 'medium':
        return styles.mediumAlert;
      case 'low':
        return styles.lowAlert;
      default:
        return styles.lowAlert;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'textual':
        return 'file-text-o';
      case 'exam':
        return 'video-camera';
      default:
        return 'exclamation-circle';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to convert detection key to readable text
  const getDetectionText = (key: string) => {
    const detectionMap: Record<string, string> = {
      multiple_faces: 'Plusieurs visages détectés',
      head_movement: 'Mouvements de tête suspects',
      object: 'Objet non autorisé détecté',
      voice: 'Voix extérieure détectée',
      identity: 'Problème de vérification d\'identité',
    };

    return detectionMap[key] || key;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.alertTypeContainer}>
            <FontAwesome
              name={getAlertTypeIcon(alertDetails.type)}
              size={24}
              color="white"
              style={styles.alertTypeIcon}
            />
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Détails de l'alerte #{alertDetails.id}
            </Text>
            <Chip
              style={[styles.alertLevelChip, getAlertLevelStyle(alertDetails.alertLevel)]}
            >
              {alertDetails.alertLevel === 'high' && 'Alerte haute'}
              {alertDetails.alertLevel === 'medium' && 'Alerte moyenne'}
              {alertDetails.alertLevel === 'low' && 'Alerte basse'}
            </Chip>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Étudiant ID:</Text>
              <Text style={styles.infoValue}>{alertDetails.studentId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(alertDetails.timestamp)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cours:</Text>
              <Text style={styles.infoValue}>{alertDetails.course}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Devoir:</Text>
              <Text style={styles.infoValue}>{alertDetails.assignment}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>
                {alertDetails.type === 'textual' ? 'Analyse textuelle' : 'Surveillance d\'examen'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Statut:</Text>
              <Chip style={styles.statusChip}>
                {alertDetails.status === 'pending' ? 'En attente' : 'Résolu'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Description</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.summaryText}>{alertDetails.summary}</Text>
          </Card.Content>
        </Card>

        {isTextualAlert && (
          <>
            <Text style={styles.sectionTitle}>Scores d'analyse</Text>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Plagiat</Text>
                  <View style={styles.scoreBarContainer}>
                    <View
                      style={[
                        styles.scoreBar,
                        getScoreBarStyle(alertDetails.details.plagiarismScore),
                        { width: `${alertDetails.details.plagiarismScore * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreValue}>
                    {Math.round(alertDetails.details.plagiarismScore * 100)}%
                  </Text>
                </View>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Contenu IA</Text>
                  <View style={styles.scoreBarContainer}>
                    <View
                      style={[
                        styles.scoreBar,
                        getScoreBarStyle(alertDetails.details.aiGeneratedScore),
                        { width: `${alertDetails.details.aiGeneratedScore * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreValue}>
                    {Math.round(alertDetails.details.aiGeneratedScore * 100)}%
                  </Text>
                </View>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Perplexité</Text>
                  <View style={styles.scoreBarContainer}>
                    <View
                      style={[
                        styles.scoreBar,
                        getPerplexityBarStyle(alertDetails.details.perplexityScore),
                        { width: `${Math.min((alertDetails.details.perplexityScore / 100) * 100, 100)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreValue}>
                    {alertDetails.details.perplexityScore.toFixed(1)}
                  </Text>
                </View>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Slymentring</Text>
                  <View style={styles.scoreBarContainer}>
                    <View
                      style={[
                        styles.scoreBar,
                        getScoreBarStyle(alertDetails.details.slymentringScore),
                        { width: `${alertDetails.details.slymentringScore * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreValue}>
                    {Math.round(alertDetails.details.slymentringScore * 100)}%
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>Extrait de texte</Text>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.textExcerpt}>{alertDetails.textExcerpt}</Text>
              </Card.Content>
            </Card>
          </>
        )}

        {isExamAlert && alertDetails.details.detections && (
          <>
            <Text style={styles.sectionTitle}>Détections</Text>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.detectionsList}>
                  {(alertDetails.details.detections as string[]).map((detection, index) => (
                    <Chip
                      key={index}
                      style={styles.detectionChip}
                      icon="alert-circle"
                    >
                      {getDetectionText(detection)}
                    </Chip>
                  ))}
                </View>

                {alertDetails.details.objectType && (
                  <Text style={styles.detectionNote}>
                    Objet détecté: {alertDetails.details.objectType}
                  </Text>
                )}

                {alertDetails.screenshots && alertDetails.screenshots.length > 0 && (
                  <View style={styles.screenshotsContainer}>
                    <Text style={styles.screenshotsTitle}>Captures d'écran:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {alertDetails.screenshots.map((screenshot, index) => (
                        <Image
                          key={index}
                          source={{ uri: screenshot }}
                          style={styles.screenshot}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </Card.Content>
            </Card>
          </>
        )}

        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={() => setShowFeedbackDialog(true)}
            style={styles.actionButton}
            icon="email"
          >
            Envoyer un retour
          </Button>

          <Button
            mode="contained"
            onPress={handleMarkResolved}
            style={[styles.actionButton, styles.resolveButton]}
            icon="check-circle"
          >
            Marquer comme résolu
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showFeedbackDialog} onDismiss={() => setShowFeedbackDialog(false)}>
          <Dialog.Title>Envoyer un retour à l'étudiant</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Votre message"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={5}
              style={styles.feedbackInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFeedbackDialog(false)}>Annuler</Button>
            <Button onPress={handleSendFeedback}>Envoyer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

// Helper function to get score bar color
function getScoreBarStyle(score: number) {
  if (score < 0.3) return styles.greenBar;
  if (score < 0.7) return styles.yellowBar;
  return styles.redBar;
}

// Helper function for perplexity score which works opposite (lower is more suspicious)
function getPerplexityBarStyle(score: number) {
  if (score > 70) return styles.greenBar;
  if (score > 30) return styles.yellowBar;
  return styles.redBar;
}

// Types
interface AlertDetail {
  id: string;
  studentId: string;
  studentName: string;
  type: 'textual' | 'exam';
  alertLevel: 'low' | 'medium' | 'high';
  summary: string;
  timestamp: Date;
  course: string;
  assignment: string;
  details: any; // This would be properly typed in a real app
  textExcerpt?: string;
  screenshots?: string[];
  status: 'pending' | 'resolved';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  alertTypeContainer: {
    backgroundColor: Colors.light.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertTypeIcon: {
    textAlign: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alertLevelChip: {
    alignSelf: 'flex-start',
  },
  highAlert: {
    backgroundColor: Colors.light.danger + '20',
  },
  mediumAlert: {
    backgroundColor: Colors.light.warning + '20',
  },
  lowAlert: {
    backgroundColor: Colors.light.success + '20',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 14,
  },
  statusChip: {
    backgroundColor: Colors.light.info + '20',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    width: 100,
    fontSize: 14,
  },
  scoreBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginRight: 8,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 5,
  },
  greenBar: {
    backgroundColor: Colors.light.success,
  },
  yellowBar: {
    backgroundColor: Colors.light.warning,
  },
  redBar: {
    backgroundColor: Colors.light.danger,
  },
  scoreValue: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  textExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detectionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detectionChip: {
    margin: 4,
  },
  detectionNote: {
    marginTop: 16,
    fontSize: 14,
    fontStyle: 'italic',
  },
  screenshotsContainer: {
    marginTop: 16,
  },
  screenshotsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  screenshot: {
    width: 120,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  resolveButton: {
    backgroundColor: Colors.light.success,
  },
  feedbackInput: {
    marginTop: 8,
  },
});
