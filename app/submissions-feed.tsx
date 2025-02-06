import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "./store";
import type { Video as VideoType } from "../types";

const { width, height } = Dimensions.get("window");
const videoHeight = height - 54;

export default function SubmissionsFeed() {
  const { originalVideoId, startingVideoId } = useLocalSearchParams<{ 
    originalVideoId: string;
    startingVideoId: string;
  }>();
  const [submissions, setSubmissions] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [originalVideo, setOriginalVideo] = useState<VideoType | null>(null);
  const videoRefs = useRef<{ [key: string]: Video }>({});
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch original video first
      const originalVideoDoc = await getDoc(doc(db, "videos", originalVideoId));
      if (originalVideoDoc.exists()) {
        setOriginalVideo(originalVideoDoc.data() as VideoType);
      }

      // Fetch all submissions for this video
      const submissionsQuery = query(
        collection(db, "videos"),
        where("originalVideoId", "==", originalVideoId)
      );

      const querySnapshot = await getDocs(submissionsQuery);
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VideoType[];

      // Find index of starting video
      const startingIndex = submissionsData.findIndex(v => v.id === startingVideoId);
      if (startingIndex !== -1) {
        // Reorder array to start from the selected video
        const reorderedSubmissions = [
          ...submissionsData.slice(startingIndex),
          ...submissionsData.slice(0, startingIndex)
        ];
        setSubmissions(reorderedSubmissions);
      } else {
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSubmission = async (submission: VideoType) => {
    await updateDoc(doc(db, "videos", submission.id), {
      submissionStatus: "accepted",
    });
    setSubmissions(submissions.map(v => v.id === submission.id ? { ...v, submissionStatus: "accepted" } : v));
    console.log("Submission accepted");
  };

  const handleRejectSubmission = async (submission: VideoType) => {
    await updateDoc(doc(db, "videos", submission.id), {
      submissionStatus: "rejected",
    });
    setSubmissions(submissions.map(v => v.id === submission.id ? { ...v, submissionStatus: "rejected" } : v));
    console.log("Submission rejected");
  };

  const renderVideo = ({ item, index }: { item: VideoType; index: number }) => {
    const isOriginalCreator = originalVideo?.userId === user?.uid;

    return (
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => ref && (videoRefs.current[item.id] = ref)}
          style={styles.video}
          source={{ uri: item.videoUrl }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={index === activeVideoIndex}
          isLooping
          isMuted={false}
        />
        
        {/* Overlay content */}
        <View style={styles.overlay}>
          {/* Right sidebar */}
          <View style={styles.rightSidebar}>
            {isOriginalCreator && (
              <>
                <TouchableOpacity 
                  style={styles.sidebarButton}
                  onPress={() => handleAcceptSubmission(item)}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={35} 
                    style={[
                      styles.rightIcon,
                      item.submissionStatus === 'accepted' && styles.activeAcceptIcon
                    ]} 
                  />
                  <Text style={styles.sidebarText}>{item.submissionStatus === 'accepted' ? 'Accepted' : 'Accept'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.sidebarButton}
                  onPress={() => handleRejectSubmission(item)}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={35} 
                    style={[
                      styles.rightIcon,
                      item.submissionStatus === 'rejected' && styles.activeRejectIcon
                    ]} 
                  />
                  <Text style={styles.sidebarText}>{item.submissionStatus === 'rejected' ? 'Rejected' : 'Reject'}</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="chatbubble-ellipses" size={35} style={styles.rightIcon} />
              <Text style={styles.sidebarText}>{item.comments || 0}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom content */}
          <View style={styles.bottomContent}>
            <Text style={styles.username}>@{item.userId.slice(0, 8)}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FE2C55" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" style={styles.rightIcon} />
      </TouchableOpacity>

      <FlatList
        data={submissions}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={({ changed }) => {
          changed.forEach((change) => {
            if (change.isViewable) {
              setActiveVideoIndex(change.index ?? 0);
            }
          });
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    width: width,
    height: videoHeight,
    backgroundColor: 'black',
  },
  video: {
    width: width,
    height: videoHeight,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rightSidebar: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sidebarText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  rightIcon: {
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
    padding: 20,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  submissionStatus: {
    color: '#FE2C55',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeAcceptIcon: {
    color: '#4CAF50', // Green color for accepted
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  activeRejectIcon: {
    color: '#FF3B30', // Red color for rejected
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  acceptedStatus: {
    color: '#4CAF50',
  },
  rejectedStatus: {
    color: '#FF3B30',
  },
});
