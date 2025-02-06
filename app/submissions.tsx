import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Submission, Video as VideoType } from "../types";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 2;

interface UserInfo {
  username: string;
}

export default function SubmissionsScreen() {
  const { videoId } = useLocalSearchParams();
  const [originalVideo, setOriginalVideo] = useState<VideoType | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfoCache, setUserInfoCache] = useState<{
    [key: string]: UserInfo;
  }>({});

  const fetchUserInfo = async (userId: string) => {
    if (userInfoCache[userId]) return userInfoCache[userId];

    try {
      const userDoc = await getDoc(doc(getFirestore(), "users", userId));
      if (userDoc.exists()) {
        const userInfo = { username: userDoc.data().username };
        setUserInfoCache((prev) => ({ ...prev, [userId]: userInfo }));
        return userInfo;
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
    return { username: userId.slice(0, 8) };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch original video
        const videoDoc = await getDoc(doc(db, "videos", videoId as string));
        if (videoDoc.exists()) {
          setOriginalVideo(videoDoc.data() as VideoType);
        }

        // Fetch submissions
        const submissionsQuery = query(
          collection(db, "videos"),
          where("originalVideoId", "==", videoId)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsData = submissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch user info for all submissions
        await Promise.all(
          submissionsData.map((sub) => fetchUserInfo(sub.userId))
        );
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  const renderSubmission = ({ item }: { item: Submission }) => (
    <TouchableOpacity
      style={styles.submissionItem}
      onPress={() => {
        router.push({
          pathname: '/submissions-feed',
          params: { 
            originalVideoId: videoId as string,
            startingVideoId: item.id,
          }
        });
      }}
    >
      <Video
        source={{ uri: item.videoUrl }}
        style={styles.submissionVideo}
        resizeMode="cover"
        shouldPlay={false}
        isMuted={true}
      />
      <View style={styles.submissionInfo}>
        <Text
          style={styles.submissionDescription}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.description}
        </Text>
        <Text style={styles.submissionUsername}>
          @{userInfoCache[item.userId]?.username || item.userId.slice(0, 8)}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.submissionStatus.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submissions</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={submissions}
        renderItem={renderSubmission}
        numColumns={2}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.originalVideoContainer}>
            <Video
              source={{ uri: originalVideo?.videoUrl }}
              style={styles.originalVideo}
              resizeMode="cover"
              shouldPlay={false}
              isMuted={true}
            />
            <View style={styles.originalVideoInfo}>
              <Text style={styles.originalVideoTitle}>Original Video</Text>
              <Text style={styles.originalVideoDescription}>
                {originalVideo?.description}
              </Text>
              <Text style={styles.submissionsCount}>
                {submissions.length} Submissions
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.submissionsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  originalVideoContainer: {
    padding: 1,
    marginBottom: 16,
  },
  originalVideo: {
    width: "50%",
    height: COLUMN_WIDTH * 1.3,
  },
  originalVideoInfo: {
    padding: 8,
  },
  originalVideoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  originalVideoDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  submissionsCount: {
    color: "#999",
    fontSize: 14,
  },
  submissionsList: {
    padding: 1,
  },
  submissionItem: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.8,
    margin: 1,
  },
  submissionVideo: {
    width: "100%",
    height: COLUMN_WIDTH * 1.3,
  },
  submissionInfo: {
    padding: 8,
  },
  submissionDescription: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  submissionUsername: {
    color: "#999",
    fontSize: 11,
    marginBottom: 4,
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
