import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { Text, Button, Chip, ActivityIndicator, Portal, Dialog } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { Audio } from 'expo-av';
import Colors from '@/constants/Colors';

export default function ExamSimulationScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.front);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [headPoseStable, setHeadPoseStable] = useState(true);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const cameraRef = useRef<Camera>(null);
  const audioRecordingRef = useRef<Audio.Recording | null>(null);

  // Request permissions on load
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      if (cameraStatus === 'granted' && audioStatus === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        setShowPermissionDialog(true);
      }
    })();

    // Cleanup
    return () => {
      if (audioRecordingRef.current) {
        stopAudioRecording();
      }
    };
  }, []);

  // Start the simulation
  const startSimulation = async () => {
    setIsInitializing(true);

    // In a real app, we would send an initial face capture to the backend for verification
    // For now, we'll simulate this process
    setTimeout(() => {
      setIdentityVerified(true);
      setIsSimulationActive(true);
      setIsInitializing(false);
      startAudioRecording();
    }, 3000);
  };

  // Stop the simulation
  const stopSimulation = () => {
    setIsSimulationActive(false);
    stopAudioRecording();

    // Reset states
    setFaceDetected(false);
    setMultipleFaces(false);
    setHeadPoseStable(true);
    setIdentityVerified(false);
  };

  // Handle face detection
  const handleFacesDetected = ({ faces }: FaceDetectionResult) => {
    if (!isSimulationActive) return;

    // Check if any face is detected
    setFaceDetected(faces.length > 0);

    // Check for multiple faces
    setMultipleFaces(faces.length > 1);

    // Check head pose stability (simplified version)
    if (faces.length === 1) {
      const face = faces[0];
      const isStable = Math.abs(face.yawAngle) < 15 && Math.abs(face.rollAngle) < 15;
      setHeadPoseStable(isStable);
    }

    // In a real app, we would periodically send face data to the backend
    // along with captured audio for more sophisticated analysis
  };

  // Audio recording functions
  const startAudioRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      audioRecordingRef.current = recording;

      // In a real app, we would stream audio data to the backend
      // to detect unauthorized voices
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopAudioRecording = async () => {
    if (!audioRecordingRef.current) return;

    try {
      await audioRecordingRef.current.stopAndUnloadAsync();
      audioRecordingRef.current = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  // Render functions
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {hasPermission ? (
        <>
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={cameraType}
              onFacesDetected={handleFacesDetected}
              faceDetectorSettings={{
                mode: FaceDetector.FaceDetectorMode.fast,
                detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                runClassifications: FaceDetector.FaceDetectorClassifications.none,
                minDetectionInterval: 500,
                tracking: true,
              }}
            />

            {isSimulationActive && (
              <View style={styles.statusOverlay}>
                <Chip
                  icon={identityVerified ? "check-circle" : "alert-circle"}
                  style={[
                    styles.statusChip,
                    identityVerified ? styles.successChip : styles.warningChip
                  ]}
                >
                  {identityVerified ? "Identité vérifiée" : "Identité non vérifiée"}
                </Chip>

                <Chip
                  icon={faceDetected ? "face" : "face-recognition"}
                  style={[
                    styles.statusChip,
                    faceDetected ? styles.successChip : styles.dangerChip
                  ]}
                >
                  {faceDetected ? "Visage détecté" : "Aucun visage détecté"}
                </Chip>

                {multipleFaces && (
                  <Chip
                    icon="account-multiple-alert"
                    style={[styles.statusChip, styles.dangerChip]}
                  >
                    Plusieurs visages détectés
                  </Chip>
                )}

                {!headPoseStable && (
                  <Chip
                    icon="head-alert"
                    style={[styles.statusChip, styles.warningChip]}
                  >
                    Mouvements de tête suspects
                  </Chip>
                )}
              </View>
            )}

            {isInitializing && (
              <View style={styles.initializingOverlay}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.initializingText}>Initialisation...</Text>
                <Text style={styles.initializingSubText}>Vérification d'identité en cours</Text>
              </View>
            )}
          </View>

          <View style={styles.controlsContainer}>
            <Text style={styles.title}>Simulation d'Examen</Text>
            <Text style={styles.description}>
              Cette fonctionnalité simule un environnement d'examen surveillé.
              La caméra et le microphone détecteront toute activité suspecte pendant la session.
            </Text>

            {isSimulationActive ? (
              <Button
                mode="contained"
                style={[styles.actionButton, styles.stopButton]}
                icon="stop-circle"
                onPress={stopSimulation}
              >
                Arrêter la simulation
              </Button>
            ) : (
              <Button
                mode="contained"
                style={styles.actionButton}
                icon="play-circle"
                onPress={startSimulation}
                disabled={isInitializing}
              >
                Démarrer la simulation
              </Button>
            )}
          </View>

          <Portal>
            <Dialog visible={showPermissionDialog} onDismiss={() => setShowPermissionDialog(false)}>
              <Dialog.Title>Permissions requises</Dialog.Title>
              <Dialog.Content>
                <Text>
                  Pour utiliser la simulation d'examen, vous devez autoriser l'accès à la caméra et au microphone.
                  Veuillez accorder ces permissions dans les paramètres de votre appareil.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowPermissionDialog(false)}>OK</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
      ) : (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Autorisation refusée</Text>
          <Text style={styles.permissionText}>
            Pour utiliser cette fonctionnalité, vous devez autoriser l'accès à la caméra et au microphone.
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              setShowPermissionDialog(true);
            }}
            style={styles.permissionButton}
          >
            Demander l'autorisation
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  cameraContainer: {
    flex: 2,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    margin: 16,
  },
  camera: {
    flex: 1,
  },
  statusOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  statusChip: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  successChip: {
    backgroundColor: Colors.light.success + '20',
  },
  warningChip: {
    backgroundColor: Colors.light.warning + '20',
  },
  dangerChip: {
    backgroundColor: Colors.light.danger + '20',
  },
  initializingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initializingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  initializingSubText: {
    color: 'white',
    marginTop: 8,
  },
  controlsContainer: {
    flex: 1,
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
    lineHeight: 22,
  },
  actionButton: {
    paddingVertical: 8,
    backgroundColor: Colors.light.primary,
  },
  stopButton: {
    backgroundColor: Colors.light.danger,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.light.darkGray,
  },
  permissionButton: {
    paddingVertical: 8,
    backgroundColor: Colors.light.primary,
  },
});
