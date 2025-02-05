import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuthStore } from "./store";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({});
