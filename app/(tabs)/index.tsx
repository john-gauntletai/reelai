import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, FlatList, StatusBar } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { router } from 'expo-router';
import { useAuthStore } from '../store';

const { width, height } = Dimensions.get('window');
const videoHeight = height - 54;

interface VideoPost {
  id: string;
  videoUrl: string;
  description: string;
  userId: string;
  createdAt: any;
  likes: number;
  views: number;
  originalVideoId?: string; // if the video is a submission
}

export default function HomeFeed() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef<{ [key: string]: Video }>({});
  const { user } = useAuthStore();

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
      })).filter((video) => !video.originalVideoId) as VideoPost[];

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

  const handleSubmissionsPress = (video: VideoPost) => {
    if (video.userId === user?.uid) {
      // If user is the creator, show submissions page
      router.push({
        pathname: '/submissions',
        params: { videoId: video.id }
      });
    } else {
      // If user is not the creator, go to create page with submission context
      router.push({
        pathname: '/create',
        params: { 
          originalVideoId: video.id
        }
      });
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
          resizeMode={ResizeMode.COVER}
          shouldPlay={index === activeVideoIndex}
        />
        
        {/* Overlay content */}
        <View style={styles.overlay}>
          {/* Right sidebar */}
          <View style={styles.rightSidebar}>
            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="heart" size={35} color="rgba(255, 255, 255, 0.9)" style={styles.rightIcon} />
              <Text style={styles.sidebarText}>{item.likes || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="chatbubble-ellipses" size={35} color="rgba(255, 255, 255, 0.9)" style={styles.rightIcon} />
              <Text style={styles.sidebarText}>{item.comments || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="bookmark" size={35} color="rgba(255, 255, 255, 0.9)" style={styles.rightIcon} />
              <Text style={styles.sidebarText}>{item.saves || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="arrow-redo" size={35} style={styles.rightIcon} />
              <Text style={styles.sidebarText}>{item.shares || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sidebarButton}
              onPress={() => handleSubmissionsPress(item)}
            >
              <Ionicons 
                name="logo-usd" 
                size={35} 
                style={[
                  styles.rightIcon,
                  item.userId === user?.uid && styles.activeIcon
                ]} 
              />
              <Text style={styles.sidebarText}>{item.applications || 0}</Text>
            </TouchableOpacity>

          </View>

          {/* Bottom content */}
          <View style={styles.bottomContent}>
            <Text style={styles.username}>@{item.userId.slice(0, 8)}</Text>
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No videos yet</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: videoHeight,
            offset: videoHeight * index,
            index,
          })}
        />
      )}
    </View>
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
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    width: width,
    height: videoHeight,
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
  rightIcon: {
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  activeIcon: {
    color: '#FE2C55',
  },
});
