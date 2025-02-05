import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store';
import { useState, useEffect } from 'react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';
import type { UserProfile } from '../../types';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = width / 3;

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState('videos');

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

    fetchProfile();
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="menu-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.username}>@{profile.username}</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="white" />
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
      <View style={styles.videoGrid}>
        {/* Add your video thumbnails here */}
        {/* This is a placeholder for the video grid */}
        {[...Array(9)].map((_, index) => (
          <View key={index} style={styles.videoThumbnail}>
            <Text style={styles.thumbnailText}>Video {index + 1}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  videoThumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderWidth: 0.5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    color: '#666',
  },
});
