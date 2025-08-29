import { BottomNavBar } from '@/components/ui/BottomNavBar';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const [showPostOptions, setShowPostOptions] = useState(false);

  // Use real user data or fallback to defaults
  const profileData = {
    username: user?.username || 'No Username',
    bio: user?.bio || 'No bio yet',
    avatarUrl: user?.avatarUrl || null,
    posts: [
      'https://example.com/post1.jpg',
      'https://example.com/post2.jpg',
      'https://example.com/post3.jpg',
      'https://example.com/post4.jpg',
      'https://example.com/post5.jpg',
      'https://example.com/post6.jpg',
    ],
    followers: 128,
    following: 64,
    postsCount: 6,
  };

  const handleEditProfile = () => {
    router.push('/edit_profile');
  };

  const handleCreatePost = () => {
    setShowPostOptions(true);
  };

  const handleSettings = () => {
    router.push('/settings_and_activity');
  };

  const handleSwitchAccount = () => {
    Alert.alert('Switch Account', 'This feature would allow switching between accounts.');
  };

  const handlePostPress = (postIndex: number) => {
    console.log('Post pressed:', postIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.usernameSection} onPress={handleSwitchAccount}>
          <Text style={styles.username}>{profileData.username}</Text>
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCreatePost}>
            <Ionicons name="add-box-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
              {profileData.avatarUrl ? (
                <Image source={{ uri: profileData.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color="#fff" />
                </View>
              )}
            </View>

            {/* Profile Stats */}
            <View style={styles.statsContainer}>
              <ProfileStat label="Posts" count={profileData.postsCount} />
              <ProfileStat label="Followers" count={profileData.followers} />
              <ProfileStat label="Following" count={profileData.following} />
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{profileData.bio}</Text>

          {/* Debug Info - Remove this later */}
          <View style={styles.debugSection}>
            <Text style={styles.debugText}>Debug Info:</Text>
            <Text style={styles.debugText}>User ID: {user?.id || 'None'}</Text>
            <Text style={styles.debugText}>Email: {user?.email || 'None'}</Text>
            <Text style={styles.debugText}>Username: {user?.username || 'None'}</Text>
            <Text style={styles.debugText}>Name: {user?.name || 'None'}</Text>
            <Text style={styles.debugText}>Bio: {user?.bio || 'None'}</Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Premium Upgrade Button */}
          <TouchableOpacity 
            style={styles.premiumButton} 
            onPress={() => router.push('/payment')}
          >
            <Ionicons name="star" size={16} color="#FFD700" style={{ marginRight: 8 }} />
            <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
                  <ProfilePostsGrid posts={profileData.posts} onPostPress={handlePostPress} />
        
        {/* Bottom Spacing for Navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar />

      {/* Post Options Modal */}
      {showPostOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setShowPostOptions(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="camera" size={24} color="#6A4C93" />
                <Text style={styles.modalOptionText}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="videocam" size={24} color="#6A4C93" />
                <Text style={styles.modalOptionText}>Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="book" size={24} color="#6A4C93" />
                <Text style={styles.modalOptionText}>Story</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const ProfileStat: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <View style={styles.statItem}>
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfilePostsGrid: React.FC<{ 
  posts: string[]; 
  onPostPress: (index: number) => void 
}> = ({ posts, onPostPress }) => {
  const columns = 3;
  const rows = Math.ceil(posts.length / columns);

  return (
    <View style={styles.postsGrid}>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <View key={rowIndex} style={styles.postsRow}>
          {Array.from({ length: columns }, (_, colIndex) => {
            const postIndex = rowIndex * columns + colIndex;
            const post = posts[postIndex];
            
            if (post) {
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.postItem}
                  onPress={() => onPostPress(postIndex)}
                >
                  <View style={styles.postImagePlaceholder}>
                    <Ionicons name="image" size={32} color="#666" />
                  </View>
                </TouchableOpacity>
              );
            } else {
              return <View key={colIndex} style={styles.postItem} />;
            }
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6A11CB',
  },
  usernameSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#6A4C93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#ccc',
  },
  bio: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'left',
  },
  editProfileButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  premiumButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  premiumButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postsGrid: {
    paddingTop: 10,
  },
  postsRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  postItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
  },
  postImagePlaceholder: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOptions: {
    gap: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  debugSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default ProfileScreen;
