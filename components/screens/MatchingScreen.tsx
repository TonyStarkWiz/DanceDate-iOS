import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { matchingService, UserProfile } from '@/services/matchingService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    PanGestureHandler,
    SafeAreaView,
    State,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface CardProps {
  user: UserProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

const Card: React.FC<CardProps> = ({ user, onSwipe, isTop }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(isTop ? 1 : 0.95)).current;

  const panGestureEvent = useRef(
    Animated.event(
      [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
      { useNativeDriver: false }
    )
  ).current;

  const onGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    translateX.setValue(translationX);
    translateY.setValue(translationY);
    rotate.setValue(translationX / 20);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        const direction = translationX > 0 ? 'right' : 'left';
        swipeCard(direction);
      } else {
        resetCard();
      }
    }
  };

  const swipeCard = (direction: 'left' | 'right') => {
    const toValue = direction === 'right' ? width * 1.5 : -width * 1.5;
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, {
        toValue: direction === 'right' ? 1 : -1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onSwipe(direction);
    });
  };

  const resetCard = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: false,
      }),
      Animated.spring(rotate, {
        toValue: 0,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const cardStyle = {
    transform: [
      { translateX },
      { translateY },
      { rotate: rotate.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-10deg', '0deg', '10deg'],
      })},
      { scale },
    ],
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ 
            uri: user.avatarUrl || 'https://via.placeholder.com/400x600/6A11CB/FFFFFF?text=No+Photo' 
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        <View style={styles.cardOverlay}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{user.name}</Text>
            <Text style={styles.cardBio}>{user.bio || 'No bio yet'}</Text>
            
            {user.danceStyles && user.danceStyles.length > 0 && (
              <View style={styles.danceStyles}>
                {user.danceStyles.slice(0, 3).map((style, index) => (
                  <View key={index} style={styles.danceStyleTag}>
                    <Text style={styles.danceStyleText}>{style}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <Text style={styles.experienceLevel}>
              Experience: {user.experienceLevel || 'Beginner'}
            </Text>
          </View>
        </View>

        {/* Like/Dislike indicators */}
        <Animated.View
          style={[
            styles.likeIndicator,
            {
              opacity: translateX.interpolate({
                inputRange: [0, width * 0.25],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.dislikeIndicator,
            {
              opacity: translateX.interpolate({
                inputRange: [-width * 0.25, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={styles.dislikeText}>NOPE</Text>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export const MatchingScreen: React.FC = () => {
  const { user } = useAuth();
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPotentialMatches();
    }
  }, [user?.id]);

  const loadPotentialMatches = async () => {
    try {
      setLoading(true);
      console.log('🧪 MatchingScreen: Loading potential matches...');
      
      const matches = await matchingService.getPotentialMatches(user!.id, 50);
      setPotentialMatches(matches);
      setCurrentIndex(0);
      
      console.log('🧪 MatchingScreen: Loaded', matches.length, 'potential matches');
    } catch (error) {
      console.error('🧪 MatchingScreen: Error loading matches:', error);
      Alert.alert('Error', 'Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user?.id || processing) return;
    
    const currentUser = potentialMatches[currentIndex];
    if (!currentUser) return;

    setProcessing(true);
    
    try {
      if (direction === 'right') {
        // Like the user
        console.log('🧪 MatchingScreen: Liking user:', currentUser.name);
        
        const result = await matchingService.likeUser(
          user.id,
          currentUser.id,
          undefined, // eventId
          'Hey! I think we\'d make great dance partners! 💃🕺'
        );

        if (result.isMatch) {
          Alert.alert(
            '🎉 It\'s a Match!',
            `You and ${currentUser.name} liked each other! You can now start chatting.`,
            [
              {
                text: 'Start Chatting',
                onPress: () => {
                  if (result.chatId) {
                    router.push(`/chat/${result.chatId}`);
                  }
                }
              },
              { text: 'Continue Swiping', style: 'cancel' }
            ]
          );
        } else {
          // Show subtle feedback
          console.log('🧪 MatchingScreen: Like sent, waiting for mutual interest');
        }
      } else {
        // Dislike the user
        console.log('🧪 MatchingScreen: Disliking user:', currentUser.name);
        await matchingService.dislikeUser(user.id, currentUser.id);
      }

      // Move to next card
      setCurrentIndex(prev => prev + 1);
      
    } catch (error) {
      console.error('🧪 MatchingScreen: Error processing swipe:', error);
      Alert.alert('Error', 'Failed to process your choice');
    } finally {
      setProcessing(false);
    }
  };

  const handleLike = () => handleSwipe('right');
  const handleDislike = () => handleSwipe('left');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Finding dance partners...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (potentialMatches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#6A11CB" />
          <Text style={styles.emptyTitle}>No More Profiles</Text>
          <Text style={styles.emptySubtitle}>
            We're looking for more dance partners in your area. Check back later!
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPotentialMatches}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Dance Partners</Text>
        <Text style={styles.subtitle}>
          {currentIndex + 1} of {potentialMatches.length} profiles
        </Text>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {potentialMatches.slice(currentIndex, currentIndex + 3).reverse().map((match, index) => (
          <Card
            key={match.id}
            user={match}
            onSwipe={handleSwipe}
            isTop={index === 2}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={handleDislike}
          disabled={processing}
        >
          <Ionicons name="close" size={30} color="#ff4757" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleLike}
          disabled={processing}
        >
          <Ionicons name="heart" size={30} color="#2ed573" />
        </TouchableOpacity>
      </View>

      {/* Processing indicator */}
      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: '#6A11CB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: width - 40,
    height: height * 0.6,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
  },
  cardInfo: {
    marginBottom: 10,
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardBio: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
    lineHeight: 22,
  },
  danceStyles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  danceStyleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  danceStyleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  experienceLevel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    right: 30,
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ed573',
    borderWidth: 3,
    borderColor: '#2ed573',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dislikeIndicator: {
    position: 'absolute',
    top: 50,
    left: 30,
    transform: [{ rotate: '-15deg' }],
  },
  dislikeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff4757',
    borderWidth: 3,
    borderColor: '#ff4757',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#fff',
  },
  likeButton: {
    backgroundColor: '#fff',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});


