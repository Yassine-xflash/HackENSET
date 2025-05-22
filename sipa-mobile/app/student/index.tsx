import React from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function StudentHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenue, étudiant</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {/* Text Analysis Feature Card */}
          <Card style={styles.featureCard} onPress={() => router.push('/student/text-analysis')}>
            <Card.Content>
              <View style={styles.featureIconContainer}>
                <FontAwesome name="file-text-o" size={30} color={Colors.light.primary} />
              </View>
              <Text style={styles.featureTitle}>Analyse Textuelle</Text>
              <Text style={styles.featureDescription}>
                Vérifiez vos textes pour le plagiat et le contenu généré par IA.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                style={styles.featureButton}
                onPress={() => router.push('/student/text-analysis')}
              >
                Commencer
              </Button>
            </Card.Actions>
          </Card>

          {/* Exam Simulation Feature Card */}
          <Card style={styles.featureCard} onPress={() => router.push('/student/exam-simulation')}>
            <Card.Content>
              <View style={styles.featureIconContainer}>
                <FontAwesome name="video-camera" size={30} color={Colors.light.primary} />
              </View>
              <Text style={styles.featureTitle}>Simulation d'Examen</Text>
              <Text style={styles.featureDescription}>
                Simulez un environnement d'examen surveillé pour vous préparer.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                style={styles.featureButton}
                onPress={() => router.push('/student/exam-simulation')}
              >
                Commencer
              </Button>
            </Card.Actions>
          </Card>

          {/* Proactive Assistant Feature Card */}
          <Card style={styles.featureCard} onPress={() => router.push('/student/assistant')}>
            <Card.Content>
              <View style={styles.featureIconContainer}>
                <FontAwesome name="comments" size={30} color={Colors.light.primary} />
              </View>
              <Text style={styles.featureTitle}>Assistant Proactif</Text>
              <Text style={styles.featureDescription}>
                Obtenez des conseils sur l'intégrité académique et les meilleures pratiques.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                style={styles.featureButton}
                onPress={() => router.push('/student/assistant')}
              >
                Discuter
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Qu'est-ce que SIPA?</Text>
          <Text style={styles.infoText}>
            SIPA (Système Intelligent de Préservation de l'Intégrité Académique) est une plateforme
            qui utilise l'intelligence artificielle pour promouvoir l'intégrité académique.
            Elle vous aide à vérifier vos travaux et à vous préparer aux examens dans un
            environnement éthique.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginTop: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  featureIconContainer: {
    backgroundColor: Colors.light.lightGray,
    padding: 16,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 8,
  },
  featureButton: {
    backgroundColor: Colors.light.primary,
  },
  infoSection: {
    backgroundColor: Colors.light.lightGray,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.darkGray,
  },
});
