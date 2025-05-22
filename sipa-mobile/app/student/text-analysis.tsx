import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Chip, ProgressBar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';

export default function TextAnalysisScreen() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TextAnalysisResults | null>(null);

  // Mock function to simulate analysis - this would connect to backend API
  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // This is mock data - in a real app, this would come from the backend
      const mockResults: TextAnalysisResults = {
        plagiarismScore: 0.25, // 25% plagiarism detected
        aiGeneratedScore: 0.65, // 65% likely AI generated
        perplexityScore: 38.2, // perplexity score
        slymentringScore: 0.42, // slymentring score
        alertLevel: 'medium', // low, medium, high
        summary: 'Ce texte présente un niveau moyen de risque. Il contient potentiellement du contenu généré par IA et quelques passages similaires à des sources existantes.',
      };

      setResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Analyse de Texte</Text>
          <Text style={styles.description}>
            Copiez et collez votre texte ci-dessous pour l'analyser et vérifier son intégrité académique.
          </Text>

          <TextInput
            multiline
            mode="outlined"
            label="Votre texte"
            value={text}
            onChangeText={setText}
            style={styles.textInput}
            numberOfLines={10}
            placeholder="Entrez ou collez votre texte ici pour l'analyser..."
          />

          <Button
            mode="contained"
            onPress={analyzeText}
            style={styles.analyzeButton}
            loading={isLoading}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? 'Analyse en cours...' : 'Analyser'}
          </Button>

          {results && (
            <Card style={styles.resultsCard}>
              <Card.Content>
                <Text style={styles.resultsTitle}>Résultats de l'analyse</Text>

                <View style={styles.alertChipContainer}>
                  <Chip
                    icon="alert-circle"
                    style={[
                      styles.alertChip,
                      results.alertLevel === 'low' && styles.lowAlertChip,
                      results.alertLevel === 'medium' && styles.mediumAlertChip,
                      results.alertLevel === 'high' && styles.highAlertChip,
                    ]}
                  >
                    {results.alertLevel === 'low' && 'Alerte Basse'}
                    {results.alertLevel === 'medium' && 'Alerte Moyenne'}
                    {results.alertLevel === 'high' && 'Alerte Haute'}
                  </Chip>
                </View>

                <Text style={styles.summaryText}>{results.summary}</Text>

                <Divider style={styles.divider} />

                <Text style={styles.scoreTitle}>Détail des scores :</Text>

                {/* Plagiarism Score */}
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Plagiat</Text>
                  <Text style={styles.scoreValue}>{Math.round(results.plagiarismScore * 100)}%</Text>
                </View>
                <ProgressBar
                  progress={results.plagiarismScore}
                  color={getColorForScore(results.plagiarismScore)}
                  style={styles.progressBar}
                />

                {/* AI Generated Score */}
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Contenu Généré par IA</Text>
                  <Text style={styles.scoreValue}>{Math.round(results.aiGeneratedScore * 100)}%</Text>
                </View>
                <ProgressBar
                  progress={results.aiGeneratedScore}
                  color={getColorForScore(results.aiGeneratedScore)}
                  style={styles.progressBar}
                />

                {/* Perplexity Score */}
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Perplexité</Text>
                  <Text style={styles.scoreValue}>{results.perplexityScore.toFixed(1)}</Text>
                </View>
                <ProgressBar
                  progress={results.perplexityScore / 100}
                  color={getColorForPerplexity(results.perplexityScore)}
                  style={styles.progressBar}
                />

                {/* Slymentring Score */}
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Slymentring</Text>
                  <Text style={styles.scoreValue}>{Math.round(results.slymentringScore * 100)}%</Text>
                </View>
                <ProgressBar
                  progress={results.slymentringScore}
                  color={getColorForScore(results.slymentringScore)}
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper functions for coloring
function getColorForScore(score: number): string {
  if (score < 0.3) return Colors.light.success;
  if (score < 0.7) return Colors.light.warning;
  return Colors.light.danger;
}

function getColorForPerplexity(score: number): string {
  if (score > 70) return Colors.light.success;
  if (score > 30) return Colors.light.warning;
  return Colors.light.danger;
}

// Type definition for text analysis results
interface TextAnalysisResults {
  plagiarismScore: number; // 0-1 range
  aiGeneratedScore: number; // 0-1 range
  perplexityScore: number; // typically 0-100
  slymentringScore: number; // 0-1 range
  alertLevel: 'low' | 'medium' | 'high';
  summary: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: 'white',
    marginBottom: 16,
    minHeight: 200,
  },
  analyzeButton: {
    marginBottom: 24,
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
  },
  resultsCard: {
    marginBottom: 24,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  alertChipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  alertChip: {
    borderRadius: 16,
  },
  lowAlertChip: {
    backgroundColor: Colors.light.success + '20',
    color: Colors.light.success,
  },
  mediumAlertChip: {
    backgroundColor: Colors.light.warning + '20',
    color: Colors.light.warning,
  },
  highAlertChip: {
    backgroundColor: Colors.light.danger + '20',
    color: Colors.light.danger,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    marginBottom: 16,
    height: 6,
    borderRadius: 3,
  },
});
