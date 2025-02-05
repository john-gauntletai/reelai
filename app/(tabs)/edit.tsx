import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import Draggable from 'react-native-draggable';


interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
}

export default function EditScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [currentText, setCurrentText] = useState('');


  const addTextOverlay = () => {
    if (currentText.trim()) {
      const newOverlay: TextOverlay = {
        id: Date.now().toString(),
        text: currentText,
        x: 50, // Initial position
        y: 50,
      };
      setTextOverlays([...textOverlays, newOverlay]);
      setCurrentText('');
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
      />
      
      {/* Text Overlays */}
      {textOverlays.map((overlay) => (
        <Draggable
          key={overlay.id}
          x={overlay.x}
          y={overlay.y}
          renderSize={0}
          isCircle
        >
          <Text style={styles.overlayText}>{overlay.text}</Text>
        </Draggable>
      ))}

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TextInput
          style={styles.textInput}
          value={currentText}
          onChangeText={setCurrentText}
          placeholder="Add text..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addTextOverlay}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => {
          router.push({
            pathname: '/savepost',
            params: { uri }
          });
        }}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploadingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    width,
    height: height - 150,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: 'white',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#FF2B55',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlayText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  nextButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FF2B55',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
