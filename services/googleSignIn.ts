import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Google Sign-In configuration (matches Android AuthViewModel)
export class GoogleSignInService {
  private static instance: GoogleSignInService;
  
  // Multiple client ID fallbacks (matches your Android implementation)
  private clientIds = [
    '915121530642-kumscbkiupu4ail03c437froeprk099t.apps.googleusercontent.com', // Web client ID
    '915121530642-idle2ci46shv3gbo193k2vnf61rc0hdk.apps.googleusercontent.com', // iOS client ID
    '915121530642-moo331i6f5ti2shg9tgqent7m9l15a2p.apps.googleusercontent.com', // Android client ID
  ];

  private constructor() {
    this.configureGoogleSignIn();
  }

  public static getInstance(): GoogleSignInService {
    if (!GoogleSignInService.instance) {
      GoogleSignInService.instance = new GoogleSignInService();
    }
    return GoogleSignInService.instance;
  }

  private configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: this.clientIds[0], // Primary web client ID
      iosClientId: this.clientIds[1], // iOS client ID
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }

  // Check if Google Play Services are available (Android equivalent)
  public async isGooglePlayServicesAvailable(): Promise<boolean> {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      return true; // If we can check sign-in status, services are available
    } catch (error) {
      console.error('🧪 Google Play Services not available:', error);
      return false;
    }
  }

  // Get Google Sign-In client (matches Android getGoogleSignInClient)
  public async getGoogleSignInClient(): Promise<boolean> {
    try {
      const isAvailable = await this.isGooglePlayServicesAvailable();
      if (!isAvailable) {
        throw new Error('Google Play Services not available');
      }
      return true;
    } catch (error) {
      console.error('🧪 Error getting Google Sign-In client:', error);
      return false;
    }
  }

  // Sign in with Google (matches Android signInWithGoogle)
  public async signIn(): Promise<{ idToken: string; user: any }> {
    try {
      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        // Get current user info
        const userInfo = await GoogleSignin.getCurrentUser();
        if (userInfo?.idToken) {
          return {
            idToken: userInfo.idToken,
            user: userInfo,
          };
        }
      }

      // Sign in
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      return {
        idToken: userInfo.idToken,
        user: userInfo,
      };
    } catch (error: any) {
      console.error('🧪 Google Sign-In error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign-in was cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign-in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw new Error('Google Sign-In failed: ' + error.message);
      }
    }
  }

  // Sign out from Google
  public async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('🧪 Google Sign-Out error:', error);
      throw error;
    }
  }

  // Revoke access (completely remove Google account)
  public async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.error('🧪 Google Revoke Access error:', error);
      throw error;
    }
  }

  // Get current user info
  public async getCurrentUser(): Promise<any> {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('🧪 Get Current User error:', error);
      return null;
    }
  }

  // Check if user is signed in
  public async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('🧪 Check Sign-In Status error:', error);
      return false;
    }
  }
}

export default GoogleSignInService.getInstance();
