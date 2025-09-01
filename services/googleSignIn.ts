// Temporarily disabled to fix native module error
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Mock Google Sign-In configuration (temporary fix)
export class GoogleSignInService {
  private static instance: GoogleSignInService;
  
  // Multiple client ID fallbacks (matches your Android implementation)
  private clientIds = [
    '915121530642-kumscbkiupu4ail03c437froeprk099t.apps.googleusercontent.com', // Web client ID
    '915121530642-idle2ci46shv3gbo193k2vnf61rc0hdk.apps.googleusercontent.com', // iOS client ID
    '915121530642-moo331i6f5ti2shg9tgqent7m9l15a2p.apps.googleusercontent.com', // Android client ID
  ];

  private constructor() {
    // Temporarily disabled configuration
    // this.configureGoogleSignIn();
    console.log('🧪 GoogleSignInService: Temporarily disabled - needs development build');
  }

  public static getInstance(): GoogleSignInService {
    if (!GoogleSignInService.instance) {
      GoogleSignInService.instance = new GoogleSignInService();
    }
    return GoogleSignInService.instance;
  }

  private configureGoogleSignIn() {
    // Temporarily disabled
    // GoogleSignin.configure({
    //   webClientId: this.clientIds[0], // Primary web client ID
    //   iosClientId: this.clientIds[1], // iOS client ID
    //   offlineAccess: true,
    //   hostedDomain: '',
    //   forceCodeForRefreshToken: true,
    // });
  }

  // Check if Google Play Services are available (Android equivalent)
  public async isGooglePlayServicesAvailable(): Promise<boolean> {
    console.log('🧪 GoogleSignInService: isGooglePlayServicesAvailable - temporarily returns false');
    return false; // Temporarily disabled
  }

  // Get Google Sign-In client (matches Android getGoogleSignInClient)
  public async getGoogleSignInClient(): Promise<boolean> {
    console.log('🧪 GoogleSignInService: getGoogleSignInClient - temporarily returns false');
    return false; // Temporarily disabled
  }

  // Sign in with Google (matches Android signInWithGoogle)
  public async signIn(): Promise<{ idToken: string; user: any }> {
    console.log('🧪 GoogleSignInService: signIn - temporarily throws error');
    throw new Error('Google Sign-In temporarily disabled. Please run: npx eas build --profile development --platform ios');
  }

  // Sign out from Google
  public async signOut(): Promise<void> {
    console.log('🧪 GoogleSignInService: signOut - temporarily disabled');
    // Temporarily disabled
  }

  // Revoke access (completely remove Google account)
  public async revokeAccess(): Promise<void> {
    console.log('🧪 GoogleSignInService: revokeAccess - temporarily disabled');
    // Temporarily disabled
  }

  // Get current user info
  public async getCurrentUser(): Promise<any> {
    console.log('🧪 GoogleSignInService: getCurrentUser - temporarily returns null');
    return null; // Temporarily disabled
  }

  // Check if user is signed in
  public async isSignedIn(): Promise<boolean> {
    console.log('🧪 GoogleSignInService: isSignedIn - temporarily returns false');
    return false; // Temporarily disabled
  }
}

export default GoogleSignInService.getInstance();
