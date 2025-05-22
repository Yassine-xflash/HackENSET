import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, Menu, Divider, List, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function EducatorDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [summaryData] = useState({
    textualAlerts: 12,
    examAlerts: 8,
    highPriorityAlerts: 5,
  });

  // Mock data for recent alerts
  const [recentAlerts] = useState<Alert[]>([
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
  ]);

  const filteredAlerts = activeFilter
    ? recentAlerts.filter(alert =>
        activeFilter === 'high'
          ? alert.alertLevel === 'high'
          : activeFilter === alert.type)
    : recentAlerts;

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Tableau de bord Éducateur</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryCardContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summaryData.textualAlerts}</Text>
                <Text style={styles.summaryLabel}>Alertes textuelles</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summaryData.examAlerts}</Text>
                <Text style={styles.summaryLabel}>Alertes d'examen</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summaryData.highPriorityAlerts}</Text>
                <Text style={styles.summaryLabel}>Haute priorité</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.alertsHeader}>
          <Text style={styles.alertsTitle}>Alertes récentes</Text>

          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFilterMenuVisible(true)}
                icon="filter-variant"
                style={styles.filterButton}
              >
                {activeFilter ? `Filtre: ${activeFilter}` : 'Filtrer'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setActiveFilter(null);
                setFilterMenuVisible(false);
              }}
              title="Tous"
            />
            <Menu.Item
              onPress={() => {
                setActiveFilter('textual');
                setFilterMenuVisible(false);
              }}
              title="Alertes textuelles"
            />
            <Menu.Item
              onPress={() => {
                setActiveFilter('exam');
                setFilterMenuVisible(false);
              }}
              title="Alertes d'examen"
            />
            <Menu.Item
              onPress={() => {
                setActiveFilter('high');
                setFilterMenuVisible(false);
              }}
              title="Haute priorité"
            />
          </Menu>
        </View>

        <View style={styles.alertsList}>
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                style={styles.alertCard}
                onPress={() => router.push(`/educator/alert-details?id=${alert.id}`)}
              >
                <Card.Content>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertIconContainer}>
                      <FontAwesome
                        name={getAlertTypeIcon(alert.type)}
                        size={20}
                        color={Colors.light.primary}
                      />
                    </View>
                    <View style={styles.alertInfo}>
                      <Text style={styles.studentId}>{alert.studentId}</Text>
                      <Text style={styles.alertTimestamp}>{formatDate(alert.timestamp)}</Text>
                    </View>
                    <Chip
                      style={[styles.alertLevelChip, getAlertLevelStyle(alert.alertLevel)]}
                    >
                      {alert.alertLevel === 'high' && 'Haute'}
                      {alert.alertLevel === 'medium' && 'Moyenne'}
                      {alert.alertLevel === 'low' && 'Basse'}
                    </Chip>
                  </View>

                  <Divider style={styles.alertDivider} />

                  <Text style={styles.alertSummary}>{alert.summary}</Text>

                  <Button
                    mode="text"
                    icon="arrow-right"
                    style={styles.viewDetailsButton}
                    contentStyle={styles.viewDetailsButtonContent}
                  >
                    Voir les détails
                  </Button>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.noAlertsContainer}>
              <Text style={styles.noAlertsText}>Aucune alerte avec ce filtre</Text>
            </View>
          )}
        </View>
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
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    elevation: 2,
    borderRadius: 8,
  },
  summaryCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.darkGray,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.light.lightGray,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterButton: {
    borderColor: Colors.light.primary,
  },
  alertsList: {
    marginBottom: 24,
  },
  alertCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  studentId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertTimestamp: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  alertLevelChip: {
    borderRadius: 12,
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
  alertDivider: {
    marginVertical: 12,
  },
  alertSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  viewDetailsButtonContent: {
    flexDirection: 'row-reverse',
  },
  noAlertsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noAlertsText: {
    fontSize: 16,
    color: Colors.light.darkGray,
  },
});
