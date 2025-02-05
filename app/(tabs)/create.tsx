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
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("Selected video:", result.assets[0].uri);
      // TODO: Navigate to edit screen with selected video
      // router.push({ pathname: '/edit', params: { uri: result.assets[0].uri } });
    }
  };

  const handleFlipCamera = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const handleToggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const startRecording = async () => {
    if (!isCameraReady || !cameraRef.current) return;

    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 300,
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
    <SafeAreaView style={styles.container}>
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
          <View style={styles.topControls}>
            <View style={styles.topControlsRow}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="close"
                  size={30}
                  color="white"
                  style={styles.iconShadow}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.soundBanner}>
                <Ionicons name="musical-notes" size={20} color="white" />
                <Text style={styles.soundBannerText}>Add sound</Text>
              </TouchableOpacity>

              <View style={styles.rightControlsColumn}>
                <TouchableOpacity style={styles.rightControlButton}>
                  <Ionicons
                    name="sync"
                    size={30}
                    color="white"
                    style={styles.iconShadow}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rightControlButton}
                  onPress={handleToggleFlash}
                >
                  <Ionicons
                    name={flash === "off" ? "flash-off" : "flash"}
                    size={30}
                    color="white"
                    style={styles.iconShadow}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.rightControlButton}>
                  <Ionicons
                    name="timer-outline"
                    size={30}
                    color="white"
                    style={styles.iconShadow}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.rightControlButton}>
                  <Ionicons
                    name="color-wand-outline"
                    size={30}
                    color="white"
                    style={styles.iconShadow}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.rightControlButton}>
                  <Ionicons
                    name="speedometer-outline"
                    size={30}
                    color="white"
                    style={styles.iconShadow}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.bottomRow}>
              <TouchableOpacity style={styles.effectsButton}>
                <Ionicons name="apps" size={30} color="white" />
                <Text style={styles.effectsText}>Templates</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recording]}
                onPress={isRecording ? stopRecording : startRecording}
                onPressOut={isRecording ? stopRecording : startRecording}
              >
                <View style={styles.recordButtonOuter} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickFromGallery}
              >
                <Ionicons name="images" size={30} color="white" />
                <Text style={styles.galleryText}>Upload</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={styles.durationRow}>
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
            </View> */}
          </View>
        </CameraView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    backgroundColor: "black",
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
    width: "100%",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  topControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  soundBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(40, 39, 39, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  soundBannerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  rightControlsColumn: {
    alignItems: "center",
    gap: 20,
  },
  rightControlButton: {
    alignItems: "center",
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  durationRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "white",
  },
  durationText: {
    color: "white",
    fontSize: 13,
  },
  recordButton: {
    width: 62,
    height: 62,
    borderRadius: 40,
    backgroundColor: "#FE2C55",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonOuter: {
    width: 75,
    height: 75,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "white",
  },
  recording: {
    width: 55,
    height: 55,
    borderRadius: 10,
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
  iconShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
});
