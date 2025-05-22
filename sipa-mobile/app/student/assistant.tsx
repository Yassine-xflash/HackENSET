import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TextInput as RNTextInput } from 'react-native';
import { Text, TextInput, Button, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';

export default function AssistantScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis l'assistant SIPA. Comment puis-je vous aider aujourd'hui concernant l'intégrité académique ou vos questions sur les examens ?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call to get assistant response
    setTimeout(() => {
      const assistantMessage = getAssistantResponse(input.trim());
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Function to generate mock responses
  // In a real app, this would be an API call to the backend
  const getAssistantResponse = (userInput: string): Message => {
    const lowercaseInput = userInput.toLowerCase();
    let responseText = '';

    if (lowercaseInput.includes('plagiat') || lowercaseInput.includes('copier')) {
      responseText = "Le plagiat est l'utilisation des idées, du travail ou des mots d'une autre personne sans attribution appropriée. Pour éviter le plagiat, assurez-vous toujours de citer vos sources correctement, paraphraser avec soin, et utiliser des guillemets pour les citations directes.";
    } else if (lowercaseInput.includes('citation') || lowercaseInput.includes('référence')) {
      responseText = "Pour citer correctement vos sources, vous pouvez utiliser différents styles comme APA, MLA ou Chicago. La règle générale est d'inclure l'auteur, le titre, la date de publication et l'éditeur. Pour les sources en ligne, incluez également l'URL et la date d'accès.";
    } else if (lowercaseInput.includes('ia') || lowercaseInput.includes('intelligence artificielle')) {
      responseText = "L'utilisation de l'IA dans les travaux académiques est un sujet complexe. Il est important de consulter les politiques de votre institution. En général, vous devriez divulguer l'utilisation d'outils d'IA et comprendre que vous êtes responsable du contenu final. L'IA devrait être un outil d'assistance, non un substitut à votre propre réflexion critique.";
    } else if (lowercaseInput.includes('stress') || lowercaseInput.includes('anxiété') || lowercaseInput.includes('pression')) {
      responseText = "Le stress des examens est normal. Pour le gérer, essayez d'établir un plan d'étude réaliste, pratiquez des techniques de relaxation comme la respiration profonde, maintenez une alimentation équilibrée et un sommeil suffisant, et n'hésitez pas à demander de l'aide auprès des services de soutien de votre établissement.";
    } else if (lowercaseInput.includes('examen') || lowercaseInput.includes('test')) {
      responseText = "Pour réussir vos examens, préparez-vous à l'avance avec un plan d'étude, comprenez bien les exigences de l'examen, pratiquez avec d'anciens examens si possible, et assurez-vous de bien vous reposer avant le jour J. Pendant l'examen, lisez attentivement les questions et gérez votre temps efficacement.";
    } else {
      responseText = "Merci pour votre question. Je suis spécialisé dans les sujets liés à l'intégrité académique, comme le plagiat, les citations, l'utilisation éthique de l'IA, la préparation aux examens et la gestion du stress académique. Comment puis-je vous aider davantage dans ces domaines ?";
    }

    return {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'assistant',
      timestamp: new Date(),
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={80} // Adjust for header
      >
        <View style={styles.header}>
          <Text style={styles.title}>Assistant SIPA</Text>
          <Text style={styles.subtitle}>
            Posez des questions sur l'intégrité académique, les citations, ou les examens
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <View
                style={[
                  styles.messageRow,
                  message.sender === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
                ]}
              >
                {message.sender === 'assistant' && (
                  <Avatar.Icon size={36} icon="robot" style={styles.avatar} />
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                {message.sender === 'user' && (
                  <Avatar.Icon size={36} icon="account" style={styles.avatar} />
                )}
              </View>
              {index < messages.length - 1 && messages[index + 1].sender !== message.sender && (
                <View style={styles.spacer} />
              )}
            </React.Fragment>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <Text style={styles.loadingText}>En train d'écrire...</Text>
            </View>
          )}
        </ScrollView>

        <Divider />

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            mode="outlined"
            value={input}
            onChangeText={setInput}
            placeholder="Tapez votre message..."
            style={styles.input}
            right={
              <TextInput.Icon
                icon="send"
                onPress={handleSend}
                disabled={!input.trim() || isLoading}
                color={!input.trim() || isLoading ? Colors.light.darkGray : Colors.light.primary}
              />
            }
            onSubmitEditing={handleSend}
            returnKeyType="send"
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.light.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  assistantBubble: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
    color: (bubbleStyle) => (bubbleStyle === styles.userBubble ? 'white' : 'black'),
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
    color: (bubbleStyle) => (bubbleStyle === styles.userBubble ? 'white' : 'black'),
  },
  avatar: {
    backgroundColor: Colors.light.lightGray,
  },
  spacer: {
    height: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  inputContainer: {
    padding: 8,
    backgroundColor: 'white',
  },
  input: {
    backgroundColor: 'white',
  },
});
