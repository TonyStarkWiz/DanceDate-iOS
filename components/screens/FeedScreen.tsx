import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { DancePostCard } from './feed/DancePostCard';
import { FeedBottomNavBar } from './feed/FeedBottomNavBar';
import { FeedTopBar } from './feed/FeedTopBar';

// Mock data for dance posts - replace with real API calls later
const mockPosts = [
  {
    id: '1',
    username: '@salsaqueen',
    caption: 'Salsa night was fire! 🔥 Had an amazing time dancing with everyone at Latin Club. The energy was incredible!',
    imageUrl: null,
    likes: 128,
    comments: 24,
    timestamp: '2 hours ago',
    danceStyle: 'Salsa',
    location: 'Latin Club, Downtown',
  },
  {
    id: '2',
    username: '@bachataboy',
    caption: 'Just finished teaching a bachata workshop! Love seeing beginners fall in love with this beautiful dance style 💃🕺',
    imageUrl: null,
    likes: 89,
    comments: 15,
    timestamp: '4 hours ago',
    danceStyle: 'Bachata',
    location: 'Dance Studio West',
  },
  {
    id: '3',
    username: '@kizomba_lover',
    caption: 'Kizomba social was magical tonight! The connection and rhythm were perfect. African music really speaks to the soul 🎵',
    imageUrl: null,
    likes: 156,
    comments: 31,
    timestamp: '6 hours ago',
    danceStyle: 'Kizomba',
    location: 'African Dance Center',
  },
  {
    id: '4',
    username: '@ballroom_pro',
    caption: 'Waltz practice session! Working on perfecting those elegant turns and smooth movements. Ballroom is pure poetry in motion ✨',
    imageUrl: null,
    likes: 203,
    comments: 42,
    timestamp: '8 hours ago',
    danceStyle: 'Ballroom',
    location: 'Grand Ballroom',
  },
  {
    id: '5',
    username: '@hiphop_dancer',
    caption: 'Breaking it down at the hip hop battle! The energy and creativity tonight were off the charts! 💥',
    imageUrl: null,
    likes: 167,
    comments: 28,
    timestamp: '10 hours ago',
    danceStyle: 'Hip Hop',
    location: 'Urban Dance Studio',
  },
];

const FeedScreen: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState('All');

  const danceStyles = ['All', 'Salsa', 'Ballroom', 'Bachata', 'Kizomba', 'Hip Hop'];

  const handleStyleFilter = (style: string) => {
    setSelectedStyle(style);
  };

  const filteredPosts = selectedStyle === 'All' 
    ? mockPosts 
    : mockPosts.filter(post => post.danceStyle === selectedStyle);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Instagram-style Bar */}
      <FeedTopBar />

      {/* Style Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {danceStyles.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.filterChip,
                selectedStyle === style && styles.filterChipActive,
              ]}
              onPress={() => handleStyleFilter(style)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStyle === style && styles.filterChipTextActive,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts Feed */}
      <ScrollView
        style={styles.postsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContent}
      >
        {filteredPosts.map((post) => (
          <DancePostCard
            key={post.id}
            post={post}
            onLike={() => console.log('Like post:', post.id)}
            onComment={() => console.log('Comment on post:', post.id)}
            onShare={() => console.log('Share post:', post.id)}
            onProfilePress={() => console.log('View profile:', post.username)}
          />
        ))}
        
        {/* Bottom Spacing for Navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <FeedBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  filterContainer: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  filterChipActive: {
    backgroundColor: '#6A4C93',
    borderColor: '#6A4C93',
  },
  filterChipText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  postsContainer: {
    flex: 1,
  },
  postsContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
});

export default FeedScreen;
