import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from './store';

export default function Layout() {
  const { user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  // Show splash screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.logo}>JobTok</Text>
        <Text style={styles.tagline}>Share your work journey</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </>
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="create"
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FE2C55',
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
});