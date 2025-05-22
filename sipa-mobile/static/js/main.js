// sipa_app/static/js/main.js

// --- Global Variables ---
let videoStream = null;
let audioStream = null;
let mediaRecorder = null;
let audioChunks = [];
let detectionInterval = null;
const AUDIO_SAMPLE_RATE = 44100; // Doit correspondre au backend Python

// --- Helper Functions ---
function displayMessage(containerId, message, type = 'bot') {
    const chatBox = document.getElementById(containerId);
    if (!chatBox) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type} mb-3`;
    const bubbleDiv = document.createElement('span');
    bubbleDiv.className = `chat-bubble ${type} px-4 py-2 rounded-full max-w-xs inline-block`;
    bubbleDiv.textContent = message;
    messageDiv.appendChild(bubbleDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

function updateRealtimeResults(results) {
    const resultsDiv = document.getElementById('realtime-detection-results');
    if (!resultsDiv) return;

    let html = `
        <p class="text-sm"><strong>Identité:</strong> ${results.identity_message} (${results.identity_score.toFixed(2)})</p>
        <p class="text-sm"><strong>Mouvement:</strong> ${results.movement_message}</p>
        <p class="text-sm"><strong>Visages:</strong> ${results.multiple_faces_message}</p>
        <p class="text-sm"><strong>Objets:</strong> ${results.objects_message} ${results.detected_object_list.length > 0 ? '(' + results.detected_object_list.join(', ') + ')' : ''}</p>
        <p class="text-sm"><strong>Voix:</strong> ${results.voice_message}</p>
        <p class="text-lg font-bold mt-2 ${results.overall_alert ? 'text-red-600' : 'text-green-600'}">
            ALERTE GLOBALE: ${results.overall_alert_message}
        </p>
    `;
    resultsDiv.innerHTML = html;
}

// --- Student Dashboard Logic ---
if (document.getElementById('student-dashboard')) {
    const studentId = document.getElementById('student-id-display').textContent;

    // --- Text Submission ---
    document.getElementById('submitTextBtn').addEventListener('click', async () => {
        const textContent = document.getElementById('submissionText').value;
        const textResultsDiv = document.getElementById('text-detection-results');
        textResultsDiv.innerHTML = '<p class="text-blue-500">Analyse en cours...</p>';

        try {
            const response = await fetch('/api/detect/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textContent, student_id: studentId })
            });
            const data = await response.json();
            
            let html = `
                <p><strong>Score Plagiat:</strong> ${data.plagiarism_score.toFixed(2)}</p>
                <p><strong>Flags Plagiat:</strong> ${data.plagiarism_flags.join(', ') || 'Aucun'}</p>
                <p><strong>Score IA:</strong> ${data.ai_content_score.toFixed(2)}</p>
                <p class="font-bold ${data.alert_level === 'high' ? 'text-red-600' : data.alert_level === 'medium' ? 'text-yellow-600' : 'text-green-600'}">
                    Niveau d'Alerte: ${data.alert_level.toUpperCase()}
                </p>
                <p class="text-sm mt-2">${data.message}</p>
            `;
            textResultsDiv.innerHTML = html;

            // Proposer des conseils via le chatbot après détection
            if (data.alert_level !== 'low') {
                const context = data.plagiarism_score > data.ai_content_score ? 'plagiarism_flagged' : 'ai_flagged';
                displayMessage('chatbot-messages', `Une alerte a été détectée. Je peux vous donner des conseils sur l'intégrité académique.`, 'bot');
                // Envoyer une requête au chatbot avec le contexte
                fetch('/api/proactive/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: 'conseils', context: context })
                })
                .then(res => res.json())
                .then(chatData => {
                    displayMessage('chatbot-messages', chatData.answer, 'bot');
                })
                .catch(err => console.error('Error getting proactive advice:', err));
            }

        } catch (error) {
            console.error('Error submitting text:', error);
            textResultsDiv.innerHTML = '<p class="text-red-500">Erreur lors de l\'analyse du texte.</p>';
        }
    });

    // --- Real-time Exam Simulation (Webcam & Microphone) ---
    document.getElementById('startExamBtn').addEventListener('click', async () => {
        const videoElement = document.getElementById('webcamVideo');
        const canvasElement = document.getElementById('webcamCanvas');
        const context = canvasElement.getContext('2d');
        const startBtn = document.getElementById('startExamBtn');
        const stopBtn = document.getElementById('stopExamBtn');

        // Reset state on backend
        await fetch('/api/reset_visual_audio_state', { method: 'POST' });

        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoElement.srcObject = videoStream;
            videoElement.play();

            // Start audio recording
            mediaRecorder = new MediaRecorder(videoStream, { mimeType: 'audio/webm;codecs=opus' });
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                console.log("Audio recording stopped.");
            };
            mediaRecorder.start(1000); // Collect audio data every 1 second

            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');

            // Start sending frames and audio chunks
            detectionInterval = setInterval(async () => {
                if (videoElement.readyState === videoElement.HAVE_ ENOUGH_DATA) {
                    canvasElement.width = videoElement.videoWidth;
                    canvasElement.height = videoElement.videoHeight;
                    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                    const imageData = canvasElement.toDataURL('image/jpeg', 0.8); // Qualité 0.8

                    let audioBase64 = null;
                    if (audioChunks.length > 0) {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
                        audioBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result.split(',')[1]);
                            reader.readAsDataURL(audioBlob);
                        });
                        audioChunks = []; // Clear chunks after sending
                    }

                    try {
                        const response = await fetch('/api/detect/realtime', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                image: imageData.split(',')[1], // Envoyer seulement la partie base64
                                audio: audioBase64,
                                student_id: studentId
                            })
                        });
                        const data = await response.json();
                        updateRealtimeResults(data);

                        // Proposer des conseils via le chatbot après détection en temps réel
                        if (data.overall_alert && data.overall_alert_message && data.overall_alert_message.includes('ALERTE')) {
                            displayMessage('chatbot-messages', `Attention: ${data.overall_alert_message}. Je peux vous donner des conseils.`, 'bot');
                            // Envoyer une requête au chatbot avec le contexte
                            let context = 'visual_audio_alert'; // Contexte générique pour les alertes visuelles/audio
                            if (data.multiple_faces_detected || !data.identity_verified) context = 'visual_alert';
                            else if (data.unexpected_voice_detected) context = 'audio_alert';

                            fetch('/api/proactive/ask', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ question: 'conseils', context: context })
                            })
                            .then(res => res.json())
                            .then(chatData => {
                                displayMessage('chatbot-messages', chatData.answer, 'bot');
                            })
                            .catch(err => console.error('Error getting proactive advice:', err));
                        }

                    } catch (error) {
                        console.error('Error sending real-time data:', error);
                        document.getElementById('realtime-detection-results').innerHTML = '<p class="text-red-500">Erreur de connexion au module de détection en temps réel.</p>';
                    }
                }
            }, 1000); // Send data every 1 second
        } catch (error) {
            console.error('Error accessing webcam/microphone:', error);
            alert('Impossible d\'accéder à la webcam ou au microphone. Veuillez vérifier les permissions.');
        }
    });

    document.getElementById('stopExamBtn').addEventListener('click', () => {
        if (detectionInterval) {
            clearInterval(detectionInterval);
            detectionInterval = null;
        }
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        document.getElementById('webcamVideo').srcObject = null;
        document.getElementById('startExamBtn').classList.remove('hidden');
        document.getElementById('stopExamBtn').classList.add('hidden');
        document.getElementById('realtime-detection-results').innerHTML = '<p class="text-gray-500">Examen arrêté.</p>';
    });

    // --- Chatbot Interaction ---
    document.getElementById('sendChatBtn').addEventListener('click', async () => {
        const chatInput = document.getElementById('chatInput');
        const question = chatInput.value.trim();
        if (!question) return;

        displayMessage('chatbot-messages', question, 'user');
        chatInput.value = ''; // Clear input

        try {
            const response = await fetch('/api/proactive/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question })
            });
            const data = await response.json();
            displayMessage('chatbot-messages', data.answer, 'bot');
        } catch (error) {
            console.error('Error communicating with chatbot:', error);
            displayMessage('chatbot-messages', 'Désolé, je ne peux pas vous aider pour le moment. Erreur de connexion.', 'bot');
        }
    });

    // Handle Enter key for chatbot
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('sendChatBtn').click();
        }
    });
}

// --- Educator Dashboard Logic ---
if (document.getElementById('educator-dashboard')) {
    async function loadAlerts() {
        const alertsListDiv = document.getElementById('alerts-list');
        alertsListDiv.innerHTML = '<p class="text-blue-500">Chargement des alertes...</p>';

        try {
            const response = await fetch('/api/educator/alerts');
            const alerts = await response.json();

            if (alerts.length === 0) {
                alertsListDiv.innerHTML = '<p class="text-gray-500">Aucune alerte récente.</p>';
                return;
            }

            alertsListDiv.innerHTML = ''; // Clear previous alerts
            alerts.forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert-item ${alert.alert_level} p-4 mb-3 rounded-lg shadow-sm`;
                
                let detailsHtml = '';
                if (alert.type === 'text') {
                    detailsHtml = `
                        <p class="text-sm">Plagiat: ${alert.details.plagiarism.score.toFixed(2)} (${alert.details.plagiarism.flags.join(', ') || 'Aucun flag'})</p>
                        <p class="text-sm">IA: ${alert.details.ai_content.score.toFixed(2)}</p>
                    `;
                } else if (alert.type === 'visual_audio') {
                    detailsHtml = `
                        <p class="text-sm">Identité: ${alert.details.identity_message} (${alert.details.identity_score.toFixed(2)})</p>
                        <p class="text-sm">Mouvement: ${alert.details.movement_message}</p>
                        <p class="text-sm">Visages: ${alert.details.multiple_faces_message}</p>
                        <p class="text-sm">Objets: ${alert.details.objects_message} ${alert.details.detected_object_list.length > 0 ? '(' + alert.details.detected_object_list.join(', ') + ')' : ''}</p>
                        <p class="text-sm">Voix: ${alert.details.voice_message}</p>
                    `;
                }

                alertDiv.innerHTML = `
                    <p class="font-semibold text-lg">${alert.message}</p>
                    <p class="text-sm text-gray-600">Étudiant: ${alert.student_id} | Type: ${alert.type.toUpperCase()} | Niveau: <span class="font-bold">${alert.alert_level.toUpperCase()}</span></p>
                    <p class="text-xs text-gray-500">${new Date(alert.timestamp).toLocaleString()}</p>
                    <div class="mt-2 text-sm text-gray-700">${detailsHtml}</div>
                `;
                alertsListDiv.appendChild(alertDiv);
            });
        } catch (error) {
            console.error('Error loading alerts:', error);
            alertsListDiv.innerHTML = '<p class="text-red-500">Erreur lors du chargement des alertes.</p>';
        }
    }

    loadAlerts();
    // Recharger les alertes toutes les 30 secondes (pour une démo)
    setInterval(loadAlerts, 30000);
}