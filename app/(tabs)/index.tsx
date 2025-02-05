import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const { width, height } = Dimensions.get('window');

interface VideoPost {
  id: string;
  videoUrl: string;
  description: string;
  userId: string;
  createdAt: any;
  likes: number;
  views: number;
}

export default function HomeScreen() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef<{ [key: string]: Video }>({});

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(videosQuery);
      const videosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VideoPost[];

      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPlaybackStatusUpdate = (status: AVPlaybackStatus, videoId: string) => {
    if (!status.isLoaded) return;

    // If video reaches end, loop it
    if (status.didJustFinish) {
      videoRefs.current[videoId]?.replayAsync();
    }
  };

  const renderVideo = ({ item, index }: { item: VideoPost; index: number }) => {
    return (
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => ref && (videoRefs.current[item.id] = ref)}
          style={styles.video}
          source={{ uri: item.videoUrl }}
          onPlaybackStatusUpdate={(status) => handleVideoPlaybackStatusUpdate(status, item.id)}
          resizeMode="cover"
          // isLooping
          shouldPlay={index === activeVideoIndex}
        />
        
        {/* Overlay content */}
        <View style={styles.overlay}>
          {/* Right sidebar */}
          <View style={styles.rightSidebar}>
            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="heart-outline" size={35} color="white" />
              <Text style={styles.sidebarText}>{item.likes || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="eye-outline" size={35} color="white" />
              <Text style={styles.sidebarText}>{item.views || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="share-social-outline" size={35} color="white" />
              <Text style={styles.sidebarText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom content */}
          <View style={styles.bottomContent}>
            <Text style={styles.username}>@user_{item.userId.slice(0, 8)}</Text>
            <Text style={styles.description}>{item.description || 'No description'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No videos yet</Text>
        </View>
      ) : (
        <FlashList
          data={videos}
          renderItem={renderVideo}
          estimatedItemSize={height}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    width: width,
    height: height,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
    backgroundColor: 'black',
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
    marginRight: 10,
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
    marginBottom: 20,
  },
});
