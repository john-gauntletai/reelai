import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarIcon: ({ size }) => (
            <TouchableOpacity
              style={{
                width: 48,
                height: 32,
                backgroundColor: '#FE2C55',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                // Prevent navigation and handle camera modal
                router.push("/create");
              }}
            >
              <Ionicons name="add" size={size} color="white" />
            </TouchableOpacity>
          ),
          tabBarStyle: {
            display: "none",
          },
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
