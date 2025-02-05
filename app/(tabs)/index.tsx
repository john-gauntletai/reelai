import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Video } from 'expo-av';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Temporary mock data - replace with your Firebase data later
const VIDEOS = [];

export default function HomeScreen() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef<{ [key: string]: Video }>({});

  const renderVideo = ({ item, index }: any) => {
    return (
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => ref && (videoRefs.current[item.id] = ref)}
          style={styles.video}
          source={{ uri: item.uri }}
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
              <Text style={styles.sidebarText}>{item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="chatbubble-outline" size={35} color="white" />
              <Text style={styles.sidebarText}>{item.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarButton}>
              <Ionicons name="share-outline" size={35} color="white" />
              <Text style={styles.sidebarText}>{item.shares}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom content */}
          <View style={styles.bottomContent}>
            <Text style={styles.username}>{item.user.username}</Text>
            <Text style={styles.description}>{item.description}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <FlashList
        data={VIDEOS}
        renderItem={renderVideo}
        estimatedItemSize={height}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
