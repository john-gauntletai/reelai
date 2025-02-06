/**
 * Firestore Schema for TikTok Clone Application
 * This file defines the data structure and types for the Firestore database
 */

import { Timestamp } from "firebase/firestore";

// User Profile
export interface UserProfile {
  userId: string; // Matches Firebase Auth UID
  username: string; // Unique username
  email: string; // User's email from Firebase Auth
  displayName?: string; // Optional display name
  bio?: string; // Optional user bio
  avatar?: string; // URL to profile picture
  followers: number; // Count of followers
  following: number; // Count of users they follow
  videoCount: number; // Count of uploaded videos
  createdAt: Timestamp; // When the profile was created
  updatedAt: Timestamp; // Last profile update
}

// Video Post
export interface Video {
  videoId: string; // Unique video identifier
  userId: string; // Reference to creator's userId
  uri: string; // Video URL in Firebase Storage
  thumbnail: string; // Thumbnail URL
  description: string; // Video caption/description
  audio: {
    // Audio information
    name: string; // Name of the audio
    creator: string; // Original audio creator
    uri: string; // Audio URL if separate from video
  };
  tags: string[]; // Hashtags
  likes: number; // Count of likes
  comments: number; // Count of comments
  shares: number; // Count of shares
  views: number; // Count of views
  duration: number; // Video duration in seconds
  dimensions: {
    // Video dimensions
    width: number;
    height: number;
  };
  createdAt: Timestamp; // When the video was posted
  isActive: boolean; // If the video is active/deleted
  originalVideoId?: string; // if the video is a submission
  submissions: number; // Count of submissions
  submissionStatus: "pending" | "accepted" | "rejected"; // Status of the submission
}

// Comment
export interface Comment {
  commentId: string; // Unique comment identifier
  videoId: string; // Reference to video
  userId: string; // User who made the comment
  text: string; // Comment content
  likes: number; // Count of likes on comment
  replies: number; // Count of replies
  createdAt: Timestamp; // When the comment was posted
  updatedAt?: Timestamp; // If comment was edited
}

// Like
export interface Like {
  userId: string; // User who liked
  videoId: string; // Video that was liked
  createdAt: Timestamp; // When the like occurred
}

// Follow Relationship
export interface Follow {
  followerId: string; // User who is following
  followingId: string; // User being followed
  createdAt: Timestamp; // When the follow occurred
}

// Saved Video
export interface SavedVideo {
  userId: string; // User who saved the video
  videoId: string; // Video that was saved
  savedAt: Timestamp; // When the video was saved
}

// Hashtag
export interface Hashtag {
  tag: string; // The hashtag text
  videoCount: number; // Number of videos using this tag
  viewCount: number; // Total views on videos with this tag
}

/**
 * Firestore Collection Paths:
 *
 * /users/{userId} - User profiles
 * /videos/{videoId} - Video posts
 * /videos/{videoId}/comments/{commentId} - Comments on videos
 * /videos/{videoId}/likes/{userId} - Likes on videos
 * /users/{userId}/followers/{followerId} - User's followers
 * /users/{userId}/following/{followingId} - Users being followed
 * /users/{userId}/savedVideos/{videoId} - User's saved videos
 * /hashtags/{tag} - Hashtag information
 */

/**
 * Common Queries:
 *
 * - Get user profile: doc('users/{userId}')
 * - Get user's videos: query('videos', where('userId', '==', '{userId}'))
 * - Get video comments: collection('videos/{videoId}/comments')
 * - Check if user liked video: doc('videos/{videoId}/likes/{userId}')
 * - Get user's saved videos: collection('users/{userId}/savedVideos')
 * - Get trending hashtags: query('hashtags', orderBy('videoCount', 'desc'))
 */
