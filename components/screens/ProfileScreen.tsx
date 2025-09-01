import { BottomNavBar } from '@/components/ui/BottomNavBar';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BackButton } from '../ui/BackButton';
import { LogoutButton } from '../ui/LogoutButton';

const ProfileScreen: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [firestoreUser, setFirestoreUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Fetch user data from Firestore
  const fetchUserFromFirestore = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        setFirestoreUser(userDoc.data());
      } else {
        setFirestoreUser(null);
      }
    } catch (error) {
      console.error('Error fetching user from Firestore:', error);
      setFirestoreUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserFromFirestore();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserFromFirestore();
  }, [user?.id]);

  // Use real user data or fallback to defaults
  const profileData = {
    username: firestoreUser?.username || user?.username || 'No Username',
    bio: firestoreUser?.bio || user?.bio || 'No bio yet',
    avatarUrl: firestoreUser?.avatarUrl || user?.avatarUrl || null,
    posts: [
      'https://example.com/post1.jpg',
      'https://example.com/post2.jpg',
      'https://example.com/post3.jpg',
      'https://example.com/post4.jpg',
      'https://example.com/post5.jpg',
      'https://example.com/post6.jpg',
    ],
    followers: firestoreUser?.followers || 128,
    following: firestoreUser?.following || 64,
    postsCount: firestoreUser?.postsCount || 6,
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality would be implemented here.');
  };

  const handleCreatePost = () => {
    setShowPostOptions(true);
  };

  const handleSettings = () => {
    router.push('/settings_and_activity');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              console.log('🧪 ProfileScreen: Starting logout process...');
              await signOutUser();
              console.log('🧪 ProfileScreen: Logout completed successfully');
              
              // Show success message and navigate
              Alert.alert(
                'Logged Out',
                'You have been successfully logged out.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Force navigation to welcome screen
                      router.replace('/welcome');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('🧪 ProfileScreen: Logout error:', error);
              Alert.alert(
                'Logout Error', 
                'Failed to logout. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleSwitchAccount = () => {
    Alert.alert('Switch Account', 'This feature would allow switching between accounts.');
  };

  const handlePostPress = (postIndex: number) => {
    console.log('Post pressed:', postIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.usernameSection} onPress={handleSwitchAccount}>
          <Text style={styles.username}>{profileData.username}</Text>
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCreatePost}>
            <Ionicons name="add-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isSigningOut && styles.actionButtonDisabled]} 
            onPress={handleLogout}
            disabled={isSigningOut}
          >
            <Ionicons 
              name={isSigningOut ? "hourglass-outline" : "log-out-outline"} 
              size={24} 
              color={isSigningOut ? "#ccc" : "#ff4757"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/logout-debug')}
          >
            <Ionicons 
              name="bug-outline" 
              size={24} 
              color="#FFD700" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

          {/* Debug Info - Instagram Style */}
          <View style={styles.debugSection}>
            <View style={styles.debugHeader}>
              <Ionicons name="bug" size={20} color="#FFD700" />
              <Text style={styles.debugTitle}>Debug Information</Text>
              <TouchableOpacity onPress={fetchUserFromFirestore} style={styles.refreshButton}>
                <Ionicons name="refresh" size={16} color="#FFD700" />
              </TouchableOpacity>
            </View>
            
            {/* Auth User Data */}
            <View style={styles.debugSubsection}>
              <Text style={styles.debugSubtitle}>🔐 Auth User (Firebase Auth)</Text>
              <Text style={styles.debugText}>
                UID: {user?.id || 'None'}
              </Text>
              <Text style={styles.debugText}>
                Email: {user?.email || 'None'}
              </Text>
              <Text style={styles.debugText}>
                Display Name: {user?.name || 'None'}
              </Text>
              <Text style={styles.debugText}>
                Email Verified: {user?.isVerified ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.debugText}>
                Provider: {getAuth().currentUser?.providerData?.[0]?.providerId || 'None'}
              </Text>
            </View>

            {/* Firestore User Data */}
            <View style={styles.debugSubsection}>
              <Text style={styles.debugSubtitle}>
                📄 Firestore User Data {loading ? '(Loading...)' : ''}
              </Text>
              {firestoreUser ? (
                <Text style={styles.debugText}>
                  {JSON.stringify(firestoreUser, null, 2)}
                </Text>
              ) : (
                <Text style={styles.debugText}>
                  No Firestore data found for this user
                </Text>
              )}
            </View>

            {/* Connection Status */}
            <View style={styles.debugSubsection}>
              <Text style={styles.debugSubtitle}>🔗 Connection Status</Text>
              <Text style={styles.debugText}>
                Auth User: {user ? '✅ Connected' : '❌ Not Connected'}
              </Text>
              <Text style={styles.debugText}>
                Firestore Data: {firestoreUser ? '✅ Found' : '❌ Not Found'}
              </Text>
              <Text style={styles.debugText}>
                Loading: {loading ? '⏳ Yes' : '✅ No'}
              </Text>
            </View>
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

          {/* Logout Button */}
          <LogoutButton />
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
  actionButtonDisabled: {
    opacity: 0.5,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  debugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  debugTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  debugSubsection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  debugSubtitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 2,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default ProfileScreen;
