import { useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Link, Redirect } from "expo-router";
import { useAuthStore } from "./store";
import "../global.css";

export default function Index() {
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

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>JobTok</Text>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.title}>Sign up for JobTok</Text>

        <Text style={styles.description}>
          Create a profile, follow other accounts, make your own videos, and
          more.
        </Text>

        <Link href="/sign-up" asChild>
          <TouchableOpacity style={styles.signUpButton}>
            <Text style={styles.buttonText}>Use phone or email</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/sign-in" asChild>
          <TouchableOpacity>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
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
  header: {
    padding: 20,
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  mainContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  signUpButton: {
    backgroundColor: "#FE2C55",
    height: 44,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  socialButton: {
    height: 44,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  footerText: {
    color: "#888",
    fontSize: 14,
  },
  loginLink: {
    color: "#FE2C55",
    fontSize: 14,
    fontWeight: "600",
  },
});
