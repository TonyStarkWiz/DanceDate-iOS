import { auth } from '@/config/firebase';
import { ExtendedUserProfile, PartialPremiumUser, PartialUserPreferences, PremiumUser, UserPreferences } from '@/types/user';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: ExtendedUserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  updateUserProfile: (updates: Partial<ExtendedUserProfile>) => Promise<void>;
  updateUserPreferences: (preferences: PartialUserPreferences) => Promise<void>;
  updatePremiumStatus: (premiumUser: PartialPremiumUser) => Promise<void>;
  refreshUserData: () => Promise<void>;
  forceClearSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Initialize Firestore
  const firestore = getFirestore();

  // Enhanced user data fetching from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<ExtendedUserProfile> => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || userData.name || '',
          email: firebaseUser.email || '',
          username: userData.username || '',
          avatarUrl: firebaseUser.photoURL || userData.avatarUrl || undefined,
          bio: userData.bio || '',
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          premiumUser: userData.premiumUser || null,
          preferences: userData.preferences || null,
          credits: userData.credits || null,
          isVerified: userData.isVerified || false,
          lastActive: userData.lastActive?.toDate() || new Date(),
          totalEvents: userData.totalEvents || 0,
          totalPartners: userData.totalPartners || 0,
          rating: userData.rating || 0,
          reviews: userData.reviews || 0,
        };
      } else {
        // Create new user profile if it doesn't exist
        const newUser: ExtendedUserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          username: '',
          avatarUrl: firebaseUser.photoURL || undefined,
          bio: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          isVerified: false,
          lastActive: new Date(),
          totalEvents: 0,
          totalPartners: 0,
          rating: 0,
          reviews: 0,
        };

        // Save to Firestore
        await setDoc(doc(firestore, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });

        return newUser;
      }
    } catch (error) {
      console.error('🧪 Error fetching user data:', error);
      // Return basic user data if Firestore fails
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        username: '',
        avatarUrl: firebaseUser.photoURL || undefined,
        bio: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        lastActive: new Date(),
        totalEvents: 0,
        totalPartners: 0,
        rating: 0,
        reviews: 0,
      };
    }
  };

  // Enhanced sign-in with profile fetching
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(result.user);
      setUser(userData);
      
      // Update last active timestamp
      await updateDoc(doc(firestore, 'users', result.user.uid), {
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('🧪 Sign in error:', error);
      throw error;
    }
  };

  // Enhanced sign-up with profile creation
  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      if (result.user) {
        await updateProfile(result.user, {
          displayName: username,
        });
      }

      // Create user profile in Firestore
      const newUser: ExtendedUserProfile = {
        id: result.user.uid,
        name: username,
        email: email,
        username: username,
        avatarUrl: undefined,
        bio: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        lastActive: new Date(),
        totalEvents: 0,
        totalPartners: 0,
        rating: 0,
        reviews: 0,
      };

      await setDoc(doc(firestore, 'users', result.user.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });

      setUser(newUser);
    } catch (error) {
      console.error('🧪 Sign up error:', error);
      throw error;
    }
  };

  // Enhanced sign-out with complete session clearing
  const signOutUser = async (): Promise<void> => {
    try {
      console.log('🧪 AuthContext: Starting complete sign out process...');
      
      // Set logout flag to prevent re-authentication
      setIsLoggingOut(true);
      
      // Temporarily disable auth state listener to prevent re-authentication
      const currentUser = user;
      
      // Update last active timestamp before signing out
      if (currentUser) {
        console.log('🧪 AuthContext: Updating last active timestamp for user:', currentUser.id);
        try {
          await updateDoc(doc(firestore, 'users', currentUser.id), {
            lastActive: serverTimestamp(),
          });
        } catch (error) {
          console.warn('🧪 AuthContext: Failed to update last active timestamp:', error);
        }
      }
      
      // Clear local state first to prevent immediate re-auth
      setUser(null);
      
      // Clear any cached data
      try {
        // Clear localStorage items
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isPremium');
          localStorage.removeItem('premiumPlan');
          localStorage.removeItem('premiumExpiry');
          localStorage.removeItem('userSession');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.warn('🧪 AuthContext: Error clearing localStorage:', error);
      }
      
      console.log('🧪 AuthContext: Calling Firebase signOut...');
      await firebaseSignOut(auth);
      console.log('🧪 AuthContext: Firebase signOut completed');
      
      // Force clear any remaining auth state
      console.log('🧪 AuthContext: Force clearing auth state...');
      try {
        // Clear any cached auth tokens
        await auth.signOut();
      } catch (error) {
        console.warn('🧪 AuthContext: Error during force signOut:', error);
      }
      
      // Force a delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🧪 AuthContext: Complete sign out process finished successfully');
    } catch (error) {
      console.error('🧪 AuthContext: Sign out error:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      throw error;
    } finally {
      // Clear logout flag after a delay
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  // Google Sign-In implementation (matches Android AuthViewModel)
  const signInWithGoogle = async (idToken: string): Promise<void> => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      
      if (result.user) {
        // Check if user profile exists in Firestore
        const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
        
        if (userDoc.exists()) {
          // User exists, fetch and update profile
          const userData = await fetchUserData(result.user);
          setUser(userData);
          
          // Update last active timestamp
          await updateDoc(doc(firestore, 'users', result.user.uid), {
            lastActive: serverTimestamp(),
          });
        } else {
          // New Google user, create profile
          const newUser: ExtendedUserProfile = {
            id: result.user.uid,
            name: result.user.displayName || '',
            email: result.user.email || '',
            username: result.user.displayName || result.user.email?.split('@')[0] || '',
            avatarUrl: result.user.photoURL || undefined,
            bio: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            isVerified: true, // Google users are verified
            lastActive: new Date(),
            totalEvents: 0,
            totalPartners: 0,
            rating: 0,
            reviews: 0,
          };

          // Save to Firestore
          await setDoc(doc(firestore, 'users', result.user.uid), {
            ...newUser,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastActive: serverTimestamp(),
          });

          setUser(newUser);
        }
      }
    } catch (error) {
      console.error('🧪 Google Sign-In error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<ExtendedUserProfile>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      
      // Update Firestore
      await updateDoc(doc(firestore, 'users', user.id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setUser(updatedUser);
    } catch (error) {
      console.error('🧪 Error updating user profile:', error);
      throw error;
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: PartialUserPreferences): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedPreferences: UserPreferences = {
        userId: user.id,
        danceInterests: new Set(),
        experienceLevel: 'BEGINNER' as any,
        goals: new Set(),
        preferredPartners: new Set(),
        availability: new Set(),
        location: null,
        lastUpdated: Date.now(),
        ...user.preferences,
        ...preferences,
      };

      await updateDoc(doc(firestore, 'users', user.id), {
        preferences: updatedPreferences,
        updatedAt: serverTimestamp(),
      });

      setUser({
        ...user,
        preferences: updatedPreferences,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('🧪 Error updating user preferences:', error);
      throw error;
    }
  };

  // Update premium status
  const updatePremiumStatus = async (premiumUser: PartialPremiumUser): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedPremiumUser: PremiumUser = {
        userId: user.id,
        isPremium: false,
        subscriptionTier: 'FREE' as any,
        aiSearchesRemaining: 5,
        aiSearchesUsed: 0,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        lastSearchDate: null,
        ...user.premiumUser,
        ...premiumUser,
      };

      await updateDoc(doc(firestore, 'users', user.id), {
        premiumUser: updatedPremiumUser,
        updatedAt: serverTimestamp(),
      });

      setUser({
        ...user,
        premiumUser: updatedPremiumUser,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('🧪 Error updating premium status:', error);
      throw error;
    }
  };

  // Force clear all session data (for debugging/testing)
  const forceClearSession = async (): Promise<void> => {
    try {
      console.log('🧪 AuthContext: Force clearing all session data...');
      
      // Clear local state immediately
      setUser(null);
      
      // Force Firebase signOut multiple times to ensure complete clearing
      try {
        await firebaseSignOut(auth);
        console.log('🧪 AuthContext: First signOut completed');
      } catch (error) {
        console.warn('🧪 AuthContext: First signOut error:', error);
      }
      
      // Wait a moment and try again
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        await firebaseSignOut(auth);
        console.log('🧪 AuthContext: Second signOut completed');
      } catch (error) {
        console.warn('🧪 AuthContext: Second signOut error:', error);
      }
      
      // Force reload the auth state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('🧪 AuthContext: Force clear session completed');
    } catch (error) {
      console.error('🧪 AuthContext: Force clear session error:', error);
      // Ensure user state is cleared even on error
      setUser(null);
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async (): Promise<void> => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(firestore, 'users', user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedUser = {
          ...user,
          ...userData,
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('🧪 Error refreshing user data:', error);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip auth state changes during logout
      if (isLoggingOut) {
        console.log('🧪 AuthContext: Skipping auth state change during logout');
        return;
      }
      
      if (firebaseUser) {
        try {
          const userData = await fetchUserData(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('🧪 Error in auth state change:', error);
          // Set basic user data if Firestore fails
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            username: '',
            avatarUrl: firebaseUser.photoURL || undefined,
            bio: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            isVerified: false,
            lastActive: new Date(),
            totalEvents: 0,
            totalPartners: 0,
            rating: 0,
            reviews: 0,
          });
        }
      } else {
        // Only clear user if not logging out
        if (!isLoggingOut) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [isLoggingOut]);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOutUser,
    signInWithGoogle,
    updateUserProfile,
    updateUserPreferences,
    updatePremiumStatus,
    refreshUserData,
    forceClearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
