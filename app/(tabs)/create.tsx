import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  Camera,
  FlashMode,
} from "expo-camera";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "expo-router";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

export default function Create() {
  const navigation = useNavigation();
  const isFocused = navigation.isFocused();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);

  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    const audioStatus = await Audio.requestPermissionsAsync();
    const galleryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    setHasCameraPermission(cameraStatus.status === "granted");
    setHasAudioPermission(audioStatus.status === "granted");
    setHasGalleryPermission(galleryStatus.status === "granted");

    if (galleryStatus.status === "granted") {
      const userGalleryMedia = await MediaLibrary.getAssetsAsync({
        sortBy: ["creationTime"],
        mediaType: "video",
      });
      setGalleryItems(userGalleryMedia.assets);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("Selected video:", result.assets[0].uri);
      // TODO: Navigate to edit screen with selected video
      // router.push({ pathname: '/edit', params: { uri: result.assets[0].uri } });
    }
  };

  const handleFlipCamera = () => {
    setType((current) => (current === "back" ? "front" : "back"));
  };

  const handleToggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const startRecording = async () => {
    if (!isCameraReady || !cameraRef.current) return;

    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
        quality: "2160p",
        mute: false,
        videoBitrate: 5000000,
      });
      console.log("Recording finished:", video.uri);
      // TODO: Navigate to edit screen with recorded video
      // router.push({ pathname: '/edit', params: { uri: video.uri } });
    } catch (error) {
      console.error("Recording failed:", error);
    }
    setIsRecording(false);
  };

  const stopRecording = () => {
    if (isRecording && cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  if (!hasCameraPermission || !hasAudioPermission || !hasGalleryPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>
          We need camera and gallery access to continue
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermissions}
        >
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flash}
          onCameraReady={() => setIsCameraReady(true)}
          ratio="16:9"
        >
          {/* Top Controls */}
          <SafeAreaView style={styles.topControls}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <View style={styles.topButtonsRow}>
              <TouchableOpacity style={styles.topButton}>
                <Ionicons name="musical-notes" size={24} color="white" />
                <Text style={styles.topButtonText}>Add sound</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleFlash}
                style={styles.topButton}
              >
                <Ionicons
                  name={flash === "off" ? "flash-off" : "flash"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Right Controls */}
          <View style={styles.rightControls}>
            <TouchableOpacity
              onPress={handleFlipCamera}
              style={styles.sideButton}
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton}>
              <Ionicons name="speedometer-outline" size={28} color="white" />
              <Text style={styles.sideButtonText}>Speed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton}>
              <Ionicons name="timer-outline" size={28} color="white" />
              <Text style={styles.sideButtonText}>Timer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton}>
              <Ionicons name="color-wand-outline" size={28} color="white" />
              <Text style={styles.sideButtonText}>Effects</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton}>
              <Ionicons name="images-outline" size={28} color="white" />
              <Text style={styles.sideButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.bottomRow}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickFromGallery}
              >
                <Ionicons name="images" size={28} color="white" />
                <Text style={styles.galleryText}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recording]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <View style={styles.recordButtonInner} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.effectsButton}>
                <Ionicons name="apps" size={28} color="white" />
                <Text style={styles.effectsText}>Templates</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.durationRow}>
              <TouchableOpacity
                style={[styles.durationOption, { backgroundColor: "#FE2C55" }]}
              >
                <Text style={styles.durationText}>15s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.durationOption}>
                <Text style={styles.durationText}>60s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.durationOption}>
                <Text style={styles.durationText}>3m</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    backgroundColor: "black",
    aspectRatio: 9 / 16, 
  },
  permissionText: {
    color: "white",
    textAlign: "center",
    marginTop: WINDOW_HEIGHT * 0.3,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: "#FE2C55",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
    alignSelf: "center",
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  topControls: {
    flexDirection: "column",
    padding: 20,
  },
  topButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  topButton: {
    alignItems: "center",
  },
  topButtonText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  rightControls: {
    position: "absolute",
    right: 50,
    top: WINDOW_HEIGHT * 0.3,
    alignItems: "center",
    gap: 24,
  },
  sideButton: {
    alignItems: "center",
  },
  sideButtonText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
  },
  durationText: {
    color: "white",
    fontSize: 13,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FE2C55",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "white",
  },
  recording: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  galleryButton: {
    alignItems: "center",
  },
  galleryText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  effectsButton: {
    alignItems: "center",
  },
  effectsText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
});
