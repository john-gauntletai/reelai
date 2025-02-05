import { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user document exists
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist (for users who signed up before we added this feature)
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          username: email.split('@')[0],
          email: email,
          followers: 0,
          following: 0,
          videoCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      router.push('/(tabs)');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>
          Log in
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity 
          style={[
            styles.loginButton,
            (!email || !password) && styles.loginButtonDisabled
          ]}
          onPress={handleSignIn}
          disabled={!email || !password}
        >
          <Text style={styles.loginButtonText}>
            Log in
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  backButton: {
    padding: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: '#FE2C55',
    fontSize: 14,
  },
  loginButton: {
    height: 44,
    borderRadius: 4,
    backgroundColor: '#FE2C55',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#FE2C55',
    fontSize: 14,
  },
}); 