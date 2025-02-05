import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store';
import { useState, useEffect } from 'react';
import { doc, getDoc, getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import type { UserProfile, Video as VideoType } from '../../types';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = width / 3;

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState('videos');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userVideos, setUserVideos] = useState<VideoType[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const db = getFirestore();
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      }
    };

    const fetchUserVideos = async () => {
      if (user) {
        try {
          setLoadingVideos(true);
          console.log(user.uid);
          const videosQuery = query(
            collection(db, 'videos'),
            where('userId', '==', user.uid),
            limit(10)
          );
          
          const querySnapshot = await getDocs(videosQuery);
          const videos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as VideoType[];

          setUserVideos(videos);
        } catch (error) {
          console.error('Error fetching user videos:', error);
        } finally {
          setLoadingVideos(false);
        }
      }
    };

    fetchProfile();
    fetchUserVideos();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderVideoThumbnail = ({ item }: { item: VideoType }) => (
    <TouchableOpacity 
      style={styles.videoThumbnail}
      onPress={() => {
        // Handle video press - maybe navigate to video detail/player
        // router.push(`/video/${item.id}`);
      }}
    >
      <Video
        source={{ uri: item.uri }}
        style={styles.thumbnailVideo}
        resizeMode="cover"
        shouldPlay={false}
        isMuted={true}
        positionMillis={0}
      />
      <View style={styles.videoStats}>
        <Ionicons name="play" size={12} color="white" />
        <Text style={styles.videoStatsText}>
          {item.views?.toLocaleString() || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderVideoGrid = () => {
    if (loadingVideos) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FE2C55" />
        </View>
      );
    }

    if (userVideos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="videocam-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No videos yet</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={userVideos}
        renderItem={renderVideoThumbnail}
        numColumns={3}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.videoGrid}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>@{profile.username}</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Ionicons name="menu-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image
            source={profile.avatar ? { uri: profile.avatar } : require('../../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.displayName}>{profile.displayName || profile.username}</Text>
          
          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.videoCount}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
          </View>

          {/* Bio */}
          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'videos' && styles.activeTab]}
            onPress={() => setSelectedTab('videos')}
          >
            <Ionicons 
              name="grid-outline" 
              size={24} 
              color={selectedTab === 'videos' ? '#FE2C55' : 'white'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'liked' && styles.activeTab]}
            onPress={() => setSelectedTab('liked')}
          >
            <Ionicons 
              name="heart-outline" 
              size={24} 
              color={selectedTab === 'liked' ? '#FE2C55' : 'white'} 
            />
          </TouchableOpacity>
        </View>

        {/* Video Grid */}
        {selectedTab === 'videos' && renderVideoGrid()}
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
            </View>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setIsModalVisible(false);
                // Add navigation to settings here
              }}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
              <Text style={styles.modalOptionText}>Settings and privacy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setIsModalVisible(false);
                handleSignOut();
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#FE2C55" />
              <Text style={[styles.modalOptionText, styles.logoutText]}>
                Log out
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  username: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  displayName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  bio: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  editButton: {
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FE2C55',
  },
  videoGrid: {
    padding: 1,
  },
  videoThumbnail: {
    flex: 1/3,
    aspectRatio: 0.8,
    margin: 1,
    backgroundColor: '#222',
    position: 'relative',
  },
  thumbnailVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  videoStats: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoStatsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  modalOptionText: {
    color: 'white',
    fontSize: 16,
  },
  logoutText: {
    color: '#FE2C55',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    fontSize: 14,
  },
});
