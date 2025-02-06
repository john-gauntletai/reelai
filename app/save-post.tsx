import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  increment,
  updateDoc,
  doc,
} from "firebase/firestore";
import { app, auth, storage, db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Video } from "expo-av";

export default function SavePost() {
  const { uri, originalVideoId } = useLocalSearchParams<{
    uri: string;
    originalVideoId?: string;
  }>();
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePost = async () => {
    if (!auth.currentUser) {
      console.error("User not authenticated");
      return;
    }

    try {
      setUploading(true);

      // Upload video to Firebase Storage
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `videos/${auth.currentUser.uid}/${Date.now()}.mp4`;
      const storageRef = ref(storage, filename);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Create base video data
          const videoData = {
            userId: auth.currentUser.uid,
            videoUrl: downloadURL,
            description,
            createdAt: serverTimestamp(),
            likes: 0,
            views: 0,
            shares: 0,
            comments: 0,
          };

          // If this is a submission, add submission-specific fields
          if (originalVideoId) {
            Object.assign(videoData, {
              originalVideoId,
              submissionStatus: "pending",
            });
          }

          await addDoc(collection(db, "videos"), videoData);
          if (originalVideoId) {
            await updateDoc(doc(db, "videos", originalVideoId), {
              submissions: increment(1),
            });
          }
          setUploading(false);
          router.push("/");
        }
      );
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {originalVideoId ? "Submit Job Application" : "New Post"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.previewContainer}>
          <Video
            source={{ uri }}
            style={styles.videoPreview}
            resizeMode="cover"
            shouldPlay={false}
            isMuted={true}
          />
          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Create more informative content when you go into greater detail with 4000 characters."
              placeholderTextColor="#999"
              multiline
              maxLength={4000}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="location-outline" size={24} color="black" />
            <Text style={styles.optionText}>Location</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="link-outline" size={24} color="black" />
            <Text style={styles.optionText}>Add link</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="globe-outline" size={24} color="black" />
            <Text style={styles.optionText}>Everyone can view this post</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={styles.optionArrow}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.postButton}
          disabled={uploading}
          onPress={handlePost}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="white" />
              <Text style={styles.uploadingText}>
                {Math.round(uploadProgress)}%
              </Text>
            </View>
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  videoPreview: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  descriptionContainer: {
    flex: 1,
  },
  descriptionInput: {
    fontSize: 16,
    color: "#000",
    textAlignVertical: "top",
  },
  optionsContainer: {
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  optionArrow: {
    marginLeft: "auto",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  postButton: {
    backgroundColor: "#FF2B55",
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: "center",
  },
  postButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
