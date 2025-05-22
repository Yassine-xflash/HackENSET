import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar, SegmentedButtons, DataTable, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function AlertsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertTypeFilter, setAlertTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'date' | 'level'>('date');

  // Mock data for alerts
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      studentId: 'student_A_123',
      type: 'textual',
      alertLevel: 'high',
      summary: 'Forte probabilité de plagiat (85%) détectée dans une soumission.',
      timestamp: new Date('2025-05-21T14:32:00'),
      details: {
        plagiarismScore: 0.85,
        aiGeneratedScore: 0.30,
        perplexityScore: 22.5,
        slymentringScore: 0.75,
      },
    },
    {
      id: '2',
      studentId: 'student_B_456',
      type: 'exam',
      alertLevel: 'medium',
      summary: 'Plusieurs personnes détectées à la caméra pendant l\'examen.',
      timestamp: new Date('2025-05-21T11:15:00'),
      details: {
        detections: ['multiple_faces', 'head_movement'],
      },
    },
    {
      id: '3',
      studentId: 'student_C_789',
      type: 'textual',
      alertLevel: 'high',
      summary: 'Contenu fortement généré par IA (92%) dans le devoir soumis.',
      timestamp: new Date('2025-05-20T16:45:00'),
      details: {
        plagiarismScore: 0.12,
        aiGeneratedScore: 0.92,
        perplexityScore: 10.2,
        slymentringScore: 0.81,
      },
    },
    {
      id: '4',
      studentId: 'student_D_101',
      type: 'exam',
      alertLevel: 'low',
      summary: 'Mouvements de tête suspects pendant l\'examen.',
      timestamp: new Date('2025-05-20T10:20:00'),
      details: {
        detections: ['head_movement'],
      },
    },
    {
      id: '5',
      studentId: 'student_E_202',
      type: 'textual',
      alertLevel: 'medium',
      summary: 'Similarité textuelle importante avec des sources publiées.',
      timestamp: new Date('2025-05-19T09:05:00'),
      details: {
        plagiarismScore: 0.62,
        aiGeneratedScore: 0.15,
        perplexityScore: 45.3,
        slymentringScore: 0.38,
      },
    },
    {
      id: '6',
      studentId: 'student_F_303',
      type: 'exam',
      alertLevel: 'high',
      summary: 'Objets non autorisés détectés pendant l\'examen (téléphone).',
      timestamp: new Date('2025-05-18T15:50:00'),
      details: {
        detections: ['object', 'head_movement'],
        objectType: 'phone',
      },
    },
    {
      id: '7',
      studentId: 'student_G_404',
      type: 'textual',
      alertLevel: 'low',
      summary: 'Faible score de perplexité détecté dans la soumission.',
      timestamp: new Date('2025-05-18T11:25:00'),
      details: {
        plagiarismScore: 0.08,
        aiGeneratedScore: 0.45,
        perplexityScore: 28.9,
        slymentringScore: 0.22,
      },
    },
  ]);

  // Apply filters
  const filteredAlerts = alerts
    .filter(alert =>
      (alertTypeFilter === 'all' || alert.type === alertTypeFilter) &&
      (alert.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
       alert.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Apply sorting
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortOrder === 'date') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      const levelOrder = { high: 3, medium: 2, low: 1 };
      return levelOrder[b.alertLevel] - levelOrder[a.alertLevel];
    }
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Alertes d'intégrité</Text>
        <Text style={styles.subtitle}>
          Surveillez et gérez les alertes générées par le système SIPA
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Rechercher par étudiant ou contenu"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filterRow}>
          <SegmentedButtons
            value={alertTypeFilter}
            onValueChange={setAlertTypeFilter}
            buttons={[
              { value: 'all', label: 'Tous' },
              { value: 'textual', label: 'Texte' },
              { value: 'exam', label: 'Examen' },
            ]}
            style={styles.segmentedButton}
          />

          <SegmentedButtons
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as 'date' | 'level')}
            buttons={[
              { value: 'date', label: 'Date' },
              { value: 'level', label: 'Niveau' },
            ]}
            style={styles.sortButton}
          />
        </View>
      </View>

      <DataTable style={styles.table}>
        <DataTable.Header>
          <DataTable.Title>Étudiant</DataTable.Title>
          <DataTable.Title>Type</DataTable.Title>
          <DataTable.Title>Niveau</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title>Actions</DataTable.Title>
        </DataTable.Header>
      </DataTable>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DataTable style={styles.table}>
          {sortedAlerts.map((alert) => (
            <DataTable.Row key={alert.id} onPress={() => router.push(`/educator/alert-details?id=${alert.id}`)}>
              <DataTable.Cell>{alert.studentId}</DataTable.Cell>
              <DataTable.Cell>
                <FontAwesome
                  name={getAlertTypeIcon(alert.type)}
                  size={16}
                  color={Colors.light.primary}
                  style={styles.tableIcon}
                />
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={[styles.tableChip, getAlertLevelStyle(alert.alertLevel)]}
                  textStyle={styles.tableChipText}
                >
                  {alert.alertLevel.charAt(0).toUpperCase() + alert.alertLevel.slice(1)}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell>{formatDate(alert.timestamp)}</DataTable.Cell>
              <DataTable.Cell>
                <Button
                  mode="text"
                  compact
                  icon="eye"
                  onPress={() => router.push(`/educator/alert-details?id=${alert.id}`)}
                  style={styles.viewButton}
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        {sortedAlerts.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              Aucune alerte ne correspond à votre recherche
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Types for our mock data
interface Alert {
  id: string;
  studentId: string;
  type: 'textual' | 'exam';
  alertLevel: 'low' | 'medium' | 'high';
  summary: string;
  timestamp: Date;
  details: any; // This would be properly typed in a real app
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  filterContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentedButton: {
    flex: 2,
    marginRight: 8,
  },
  sortButton: {
    flex: 1,
  },
  table: {
    backgroundColor: 'white',
  },
  tableIcon: {
    width: 20,
    textAlign: 'center',
  },
  tableChip: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableChipText: {
    fontSize: 10,
    marginVertical: 0,
    paddingVertical: 0,
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
  viewButton: {
    margin: 0,
    padding: 0,
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
  },
});
