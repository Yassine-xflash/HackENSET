import React, { useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function AuthScreen() {
  const router = useRouter();
  const [userType, setUserType] = useState<'student' | 'educator' | null>(null);
  const [userId, setUserId] = useState('');
  const [userIdError, setUserIdError] = useState('');

  const handleLogin = () => {
    if (!userId.trim()) {
      setUserIdError('Veuillez entrer un identifiant');
      return;
    }

    if (userType === 'student') {
      // For MVP, we're just using a simple ID for students
      router.replace('/student/');
    } else if (userType === 'educator') {
      // For educators, we would typically have more authentication
      router.replace('/educator/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SIPA</Text>
        <Text style={styles.subtitle}>
          Système Intelligent de Préservation de l'Intégrité Académique
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.heroText}>
        <Text style={styles.heroTitle}>
          Bienvenue sur SIPA
        </Text>
        <Text style={styles.heroSubtitle}>
          Votre plateforme intelligente pour promouvoir l'éthique, prévenir la fraude et assurer une évaluation équitable.
        </Text>
      </View>

      <View style={styles.roleSelector}>
        <Text style={styles.roleTitle}>Je suis :</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              userType === 'student' && styles.selectedRoleButton
            ]}
            onPress={() => setUserType('student')}
          >
            <Text style={[
              styles.roleButtonText,
              userType === 'student' && styles.selectedRoleButtonText
            ]}>Étudiant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              userType === 'educator' && styles.selectedRoleButton
            ]}
            onPress={() => setUserType('educator')}
          >
            <Text style={[
              styles.roleButtonText,
              userType === 'educator' && styles.selectedRoleButtonText
            ]}>Éducateur</Text>
          </TouchableOpacity>
        </View>
      </View>

      {userType && (
        <View style={styles.form}>
          <TextInput
            label="Identifiant"
            value={userId}
            onChangeText={(text) => {
              setUserId(text);
              setUserIdError('');
            }}
            mode="outlined"
            style={styles.input}
            error={!!userIdError}
          />
          {userIdError ? <Text style={styles.errorText}>{userIdError}</Text> : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
          >
            Connexion
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
    marginTop: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  heroText: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.light.darkGray,
  },
  roleSelector: {
    marginBottom: 30,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleButton: {
    backgroundColor: Colors.light.lightGray,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: Colors.light.primary,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.darkGray,
  },
  selectedRoleButtonText: {
    color: 'white',
  },
  form: {
    marginTop: 20,
  },
  input: {
    marginBottom: 5,
  },
  errorText: {
    color: Colors.light.danger,
    marginBottom: 15,
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: Colors.light.primary,
  },
});
