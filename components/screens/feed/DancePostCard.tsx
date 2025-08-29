import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DancePost {
  id: string;
  username: string;
  caption: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  timestamp: string;
  danceStyle: string;
  location: string;
}

interface DancePostCardProps {
  post: DancePost;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfilePress: () => void;
}

export const DancePostCard: React.FC<DancePostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onProfilePress,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
    onLike();
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileSection} onPress={onProfilePress}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.location}>{post.location}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <View style={styles.imageContainer}>
        {post.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={48} color="#666" />
            <Text style={styles.placeholderText}>Dance Photo</Text>
          </View>
        )}
      </View>

      {/* Post Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#ff4757' : '#fff'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Post Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likes}>{likeCount.toLocaleString()} likes</Text>
        
        <View style={styles.captionContainer}>
          <Text style={styles.usernameCaption}>{post.username}</Text>
          <Text style={styles.caption}> {post.caption}</Text>
        </View>
        
        <Text style={styles.comments}>
          View all {post.comments} comments
        </Text>
        
        <Text style={styles.timestamp}>{post.timestamp}</Text>
        
        {/* Dance Style Tag */}
        <View style={styles.danceStyleTag}>
          <Text style={styles.danceStyleText}>{post.danceStyle}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A4C93',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#ccc',
  },
  moreButton: {
    padding: 4,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#2A2A2A',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  bookmarkButton: {
    padding: 4,
  },
  postInfo: {
    padding: 12,
    paddingTop: 0,
  },
  likes: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  captionContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  usernameCaption: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  caption: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  comments: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  danceStyleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#6A4C93',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  danceStyleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

