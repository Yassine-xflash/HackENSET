import axios from 'axios';

// Define the base URL for your Flask backend
// For development on a local network, this could be your computer's local IP address
// For production, this would be your actual backend URL
const API_BASE_URL = 'http://YOUR_FLASK_BACKEND_URL';

// Create an axios instance with default configurations
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// For MVP/demo purposes, these functions can be used with mock data or real backend
export const apiService = {
  /**
   * Authentication
   */
  // Student identification
  identifyStudent: async (studentId: string) => {
    try {
      // For MVP, we can bypass actual backend authentication
      // return await apiClient.post('/auth/student', { studentId });

      // Mock successful response for MVP
      return {
        success: true,
        data: {
          studentId,
          name: 'Student ' + studentId,
        },
      };
    } catch (error) {
      console.error('Error identifying student:', error);
      throw error;
    }
  },

  // Educator login
  loginEducator: async (credentials: { username: string; password: string }) => {
    try {
      // In a real app, this would call the backend
      // return await apiClient.post('/auth/educator', credentials);

      // Mock successful response for MVP
      return {
        success: true,
        data: {
          educatorId: 'edu_123',
          name: 'Educator Name',
          token: 'mock_token_12345',
        },
      };
    } catch (error) {
      console.error('Error logging in educator:', error);
      throw error;
    }
  },

  /**
   * Text Analysis
   */
  analyzeText: async (text: string, studentId: string) => {
    try {
      // In a real app, this would send the text to the backend for analysis
      // return await apiClient.post('/analyze/text', { text, studentId });

      // For MVP, we simulate the backend response
      const mockResults = {
        plagiarismScore: Math.random() * 0.7, // Random score between 0-0.7
        aiGeneratedScore: Math.random() * 0.8, // Random score between 0-0.8
        perplexityScore: 10 + Math.random() * 60, // Random score between 10-70
        slymentringScore: Math.random() * 0.6, // Random score between 0-0.6
        alertLevel: 'medium' as 'low' | 'medium' | 'high',
        summary: 'Analyse complétée. Des indicateurs potentiels de problèmes d\'intégrité ont été détectés.',
      };

      // Set the alert level based on the scores
      const maxScore = Math.max(
        mockResults.plagiarismScore,
        mockResults.aiGeneratedScore,
        mockResults.slymentringScore,
        1 - (mockResults.perplexityScore / 100), // Invert perplexity score for comparison
      );

      if (maxScore > 0.7) {
        mockResults.alertLevel = 'high';
        mockResults.summary = 'Alerte haute: Des indicateurs significatifs de problèmes d\'intégrité académique ont été détectés.';
      } else if (maxScore > 0.4) {
        mockResults.alertLevel = 'medium';
        mockResults.summary = 'Alerte moyenne: Certains indicateurs de problèmes d\'intégrité ont été identifiés.';
      } else {
        mockResults.alertLevel = 'low';
        mockResults.summary = 'Alerte basse: Peu d\'indicateurs de problèmes d\'intégrité détectés.';
      }

      return {
        success: true,
        data: mockResults,
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  },

  /**
   * Exam Simulation
   */
  // Initialize an exam session
  startExamSession: async (studentId: string) => {
    try {
      // In a real app, this would notify the backend that an exam session is starting
      // return await apiClient.post('/exam/start', { studentId });

      // Mock response
      return {
        success: true,
        data: {
          sessionId: 'session_' + Date.now(),
          message: 'Session d\'examen initialisée',
        },
      };
    } catch (error) {
      console.error('Error starting exam session:', error);
      throw error;
    }
  },

  // End an exam session
  endExamSession: async (sessionId: string) => {
    try {
      // In a real app, this would notify the backend that the exam session is ending
      // return await apiClient.post('/exam/end', { sessionId });

      // Mock response
      return {
        success: true,
        data: {
          message: 'Session d\'examen terminée',
        },
      };
    } catch (error) {
      console.error('Error ending exam session:', error);
      throw error;
    }
  },

  // Process a video frame for exam monitoring
  processVideoFrame: async (
    sessionId: string,
    frameData: string, // base64 encoded image
  ) => {
    try {
      // In a real app, this would send the frame to the backend for analysis
      // return await apiClient.post('/exam/process-frame', { sessionId, frameData });

      // Mock response simulating different detection scenarios
      const detections = [];
      const randomFactor = Math.random();

      // Randomly decide if we detect face, multiple faces, or no face
      if (randomFactor < 0.05) {
        // 5% chance of no face detected
        detections.push({ type: 'no_face', confidence: 0.9 });
      } else if (randomFactor < 0.1) {
        // Additional 5% chance of multiple faces
        detections.push({ type: 'multiple_faces', confidence: 0.8 });
      } else {
        // 90% chance of face detected
        detections.push({ type: 'face_detected', confidence: 0.95 });

        // 20% chance of head movement
        if (Math.random() < 0.2) {
          detections.push({ type: 'head_movement', confidence: 0.7 });
        }

        // 10% chance of object detection
        if (Math.random() < 0.1) {
          detections.push({
            type: 'object_detected',
            confidence: 0.8,
            objectType: Math.random() < 0.5 ? 'phone' : 'document',
          });
        }
      }

      return {
        success: true,
        data: {
          detections,
          faceVerificationStatus: randomFactor < 0.1 ? 'unverified' : 'verified',
        },
      };
    } catch (error) {
      console.error('Error processing video frame:', error);
      throw error;
    }
  },

  // Process audio for exam monitoring
  processAudio: async (
    sessionId: string,
    audioData: string, // base64 encoded audio
  ) => {
    try {
      // In a real app, this would send the audio to the backend for analysis
      // return await apiClient.post('/exam/process-audio', { sessionId, audioData });

      // Mock response
      const hasExternalVoice = Math.random() < 0.15; // 15% chance of external voice detected

      return {
        success: true,
        data: {
          hasExternalVoice,
          confidence: hasExternalVoice ? 0.8 : 0.1,
        },
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    }
  },

  /**
   * Educator Dashboard
   */
  // Get alerts for the educator dashboard
  getAlerts: async (filters?: {
    type?: 'textual' | 'exam',
    level?: 'low' | 'medium' | 'high',
    studentId?: string,
  }) => {
    try {
      // In a real app, this would fetch alerts from the backend
      // return await apiClient.get('/educator/alerts', { params: filters });

      // Mock response with sample alerts
      const mockAlerts = [
        {
          id: '1',
          studentId: 'student_A_123',
          type: 'textual',
          alertLevel: 'high',
          summary: 'Forte probabilité de plagiat (85%) détectée dans une soumission.',
          timestamp: new Date('2025-05-21T14:32:00').toISOString(),
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
          timestamp: new Date('2025-05-21T11:15:00').toISOString(),
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
          timestamp: new Date('2025-05-20T16:45:00').toISOString(),
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
          timestamp: new Date('2025-05-20T10:20:00').toISOString(),
          details: {
            detections: ['head_movement'],
          },
        },
      ];

      // Apply filters if provided
      let filteredAlerts = [...mockAlerts];

      if (filters) {
        if (filters.type) {
          filteredAlerts = filteredAlerts.filter(alert => alert.type === filters.type);
        }

        if (filters.level) {
          filteredAlerts = filteredAlerts.filter(alert => alert.alertLevel === filters.level);
        }

        if (filters.studentId) {
          filteredAlerts = filteredAlerts.filter(alert =>
            alert.studentId.toLowerCase().includes(filters.studentId!.toLowerCase())
          );
        }
      }

      return {
        success: true,
        data: {
          alerts: filteredAlerts,
          total: filteredAlerts.length,
          summary: {
            textualAlerts: filteredAlerts.filter(a => a.type === 'textual').length,
            examAlerts: filteredAlerts.filter(a => a.type === 'exam').length,
            highPriorityAlerts: filteredAlerts.filter(a => a.alertLevel === 'high').length,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  // Get details for a specific alert
  getAlertDetails: async (alertId: string) => {
    try {
      // In a real app, this would fetch detailed information about an alert
      // return await apiClient.get(`/educator/alerts/${alertId}`);

      // Mock response with detailed alert information
      // In a real app, this would be fetched from the backend based on the alertId
      return {
        success: true,
        data: {
          id: alertId,
          studentId: 'student_A_123',
          studentName: 'Étudiant A',
          type: Math.random() > 0.5 ? 'textual' : 'exam',
          alertLevel: 'high',
          summary: 'Forte probabilité de plagiat (85%) détectée dans une soumission.',
          timestamp: new Date('2025-05-21T14:32:00').toISOString(),
          course: 'Introduction à la Programmation',
          assignment: 'Devoir #3 - Algorithmes',
          details: {
            plagiarismScore: 0.85,
            aiGeneratedScore: 0.30,
            perplexityScore: 22.5,
            slymentringScore: 0.75,
            detections: ['multiple_faces', 'head_movement'],
          },
          textExcerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.',
          status: 'pending',
        },
      };
    } catch (error) {
      console.error('Error fetching alert details:', error);
      throw error;
    }
  },

  // Mark an alert as resolved
  resolveAlert: async (alertId: string, resolution?: string) => {
    try {
      // In a real app, this would update the status of an alert on the backend
      // return await apiClient.post(`/educator/alerts/${alertId}/resolve`, { resolution });

      // Mock response
      return {
        success: true,
        data: {
          message: 'Alerte marquée comme résolue',
        },
      };
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  },

  // Send feedback to a student regarding an alert
  sendFeedback: async (alertId: string, feedback: string) => {
    try {
      // In a real app, this would send feedback to the student via the backend
      // return await apiClient.post(`/educator/alerts/${alertId}/feedback`, { feedback });

      // Mock response
      return {
        success: true,
        data: {
          message: 'Feedback envoyé à l\'étudiant',
        },
      };
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw error;
    }
  },

  /**
   * Proactive Assistant (Chatbot)
   */
  // Send a message to the chatbot and get a response
  getChatbotResponse: async (message: string, context?: string) => {
    try {
      // In a real app, this would send the message to the backend chatbot service
      // return await apiClient.post('/assistant/message', { message, context });

      // For MVP, we'll use a simple rule-based response system
      // (This was moved to the assistant.tsx component directly for simplicity)
      return {
        success: true,
        data: {
          response: 'Je suis désolé, mais je ne peux pas vous aider avec cette demande pour le moment.',
          context: context || '',
        },
      };
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      throw error;
    }
  },
};

export default apiService;
