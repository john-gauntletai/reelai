import { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
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
    <SafeAreaView className="flex-1 bg-black">
      <TouchableOpacity 
        className="p-5"
        onPress={() => router.back()}
      >
        <Text className="text-white text-2xl">←</Text>
      </TouchableOpacity>

      <View className="flex-1 px-5 gap-5">
        <Text className="text-2xl font-bold text-white mb-5 text-center">
          Log in
        </Text>
        
        <TextInput
          className="h-11 border-b border-b-zinc-700 text-white text-base"
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="h-11 border-b border-b-zinc-700 text-white text-base"
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text className="text-[#FE2C55] text-sm">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity 
          className={`h-11 rounded bg-[#FE2C55] justify-center items-center mt-5 
            ${(!email || !password) ? 'opacity-50' : ''}`}
          onPress={handleSignIn}
          disabled={!email || !password}
        >
          <Text className="text-white text-base font-semibold">
            Log in
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center mt-5">
          <Text className="text-[#FE2C55] text-sm">
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 