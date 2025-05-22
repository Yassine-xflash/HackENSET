import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Switch as RNSwitch } from 'react-native';
import { Text, List, Divider, Button, Switch, Dialog, Portal, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function SettingsScreen() {
  const router = useRouter();

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);

  // Alert thresholds
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState('');
  const [thresholdType, setThresholdType] = useState<ThresholdType | null>(null);
  const [thresholds, setThresholds] = useState({
    plagiarism: 65,  // Percentage
    aiGenerated: 70, // Percentage
    perplexity: 30,  // Raw score (lower is more suspicious)
    slymentring: 60, // Percentage
  });

  // Export settings
  const [exportWithStudentDetails, setExportWithStudentDetails] = useState(true);

  // Dialog for threshold setting
  const openThresholdDialog = (type: ThresholdType) => {
    setThresholdType(type);
    setCurrentThreshold(thresholds[type].toString());
    setShowThresholdDialog(true);
  };

  const saveThreshold = () => {
    if (!thresholdType) return;

    const value = parseInt(currentThreshold);
    if (isNaN(value)) {
      Alert.alert('Erreur', 'Veuillez entrer une valeur numérique valide');
      return;
    }

    // Validate ranges based on threshold type
    let isValid = true;
    let minValue = 0;
    let maxValue = 100;

    if (thresholdType === 'perplexity') {
      minValue = 1;
      maxValue = 100;
      if (value < minValue || value > maxValue) {
        isValid = false;
      }
    } else {
      // For percentage-based thresholds
      if (value < 0 || value > 100) {
        isValid = false;
      }
    }

    if (!isValid) {
      Alert.alert('Erreur', `La valeur doit être entre ${minValue} et ${maxValue}`);
      return;
    }

    setThresholds({
      ...thresholds,
      [thresholdType]: value,
    });

    setShowThresholdDialog(false);
  };

  // Logout function
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: () => router.replace('/auth'),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Paramètres</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <List.Item
            title="Notifications par email"
            description="Recevoir des alertes par email"
            right={props => <Switch value={emailNotifications} onValueChange={setEmailNotifications} />}
          />
          <Divider />
          <List.Item
            title="Notifications push"
            description="Recevoir des alertes sur votre appareil"
            right={props => <Switch value={pushNotifications} onValueChange={setPushNotifications} />}
          />
          <Divider />
          <List.Item
            title="Alertes haute priorité uniquement"
            description="Ne recevoir que les alertes de niveau élevé"
            right={props => <Switch value={highPriorityOnly} onValueChange={setHighPriorityOnly} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seuils d'alerte</Text>
          <Text style={styles.sectionDescription}>
            Configurez les valeurs à partir desquelles une alerte sera générée
          </Text>

          <List.Item
            title="Seuil de plagiat"
            description={`Alerte si le score dépasse ${thresholds.plagiarism}%`}
            onPress={() => openThresholdDialog('plagiarism')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Seuil de contenu IA"
            description={`Alerte si le score dépasse ${thresholds.aiGenerated}%`}
            onPress={() => openThresholdDialog('aiGenerated')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Seuil de perplexité"
            description={`Alerte si le score est inférieur à ${thresholds.perplexity}`}
            onPress={() => openThresholdDialog('perplexity')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Seuil de Slymentring"
            description={`Alerte si le score dépasse ${thresholds.slymentring}%`}
            onPress={() => openThresholdDialog('slymentring')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exportation</Text>
          <List.Item
            title="Inclure les détails des étudiants"
            description="Inclure les identifiants des étudiants dans les rapports exportés"
            right={props => <Switch value={exportWithStudentDetails} onValueChange={setExportWithStudentDetails} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <List.Item
            title="Modifier le mot de passe"
            onPress={() => Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Déconnexion"
            titleStyle={styles.logoutText}
            onPress={handleLogout}
            left={props => <List.Icon {...props} icon="logout" color={Colors.light.danger} />}
          />
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SIPA Mobile v1.0.0</Text>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showThresholdDialog} onDismiss={() => setShowThresholdDialog(false)}>
          <Dialog.Title>
            {thresholdType === 'plagiarism' && 'Seuil de plagiat'}
            {thresholdType === 'aiGenerated' && 'Seuil de contenu IA'}
            {thresholdType === 'perplexity' && 'Seuil de perplexité'}
            {thresholdType === 'slymentring' && 'Seuil de Slymentring'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Valeur du seuil"
              value={currentThreshold}
              onChangeText={setCurrentThreshold}
              keyboardType="numeric"
              style={styles.thresholdInput}
            />
            <Text style={styles.thresholdDescription}>
              {thresholdType === 'perplexity'
                ? 'Une valeur plus basse indique un potentiel contenu généré par IA. Entrez une valeur entre 1 et 100.'
                : 'Entrez une valeur entre 0 et 100 (pourcentage).'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowThresholdDialog(false)}>Annuler</Button>
            <Button onPress={saveThreshold}>Enregistrer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

// Types
type ThresholdType = 'plagiarism' | 'aiGenerated' | 'perplexity' | 'slymentring';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoutText: {
    color: Colors.light.danger,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  thresholdInput: {
    marginBottom: 16,
  },
  thresholdDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
  },
});
