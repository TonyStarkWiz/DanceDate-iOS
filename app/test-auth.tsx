import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function TestAuthScreen() {
  const { user, loading, signIn, signUp, signOutUser } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('testuser');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    runTests();
  }, [user]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    setTestResults([]);
    addTestResult('🧪 Starting Firebase Auth & Firestore tests...');

    try {
      // Test 1: Check if user is authenticated
      if (user) {
        addTestResult('✅ User is authenticated');
        addTestResult(`📧 Email: ${user.email}`);
        addTestResult(`👤 Name: ${user.name}`);
        addTestResult(`🆔 UID: ${user.id}`);
      } else {
        addTestResult('❌ No user authenticated');
      }

      // Test 2: Test Firestore connection
      try {
        const allUsers = await firestoreService.getAllUsers();
        addTestResult(`✅ Firestore connection working - Found ${allUsers.length} users`);
      } catch (error) {
        addTestResult(`❌ Firestore connection failed: ${error}`);
      }

      // Test 3: Test creating a test document
      try {
        const testDoc = await firestoreService.createUser({
          uid: 'test-user-' + Date.now(),
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString()
        });
        addTestResult('✅ Test document created in Firestore');
        
        // Clean up test document
        await firestoreService.deleteDocument('users', testDoc.id);
        addTestResult('✅ Test document cleaned up');
      } catch (error) {
        addTestResult(`❌ Firestore write test failed: ${error}`);
      }

    } catch (error) {
      addTestResult(`❌ Test suite failed: ${error}`);
    }
  };

  const handleSignIn = async () => {
    try {
      addTestResult('🧪 Attempting sign in...');
      await signIn(email, password);
      addTestResult('✅ Sign in successful');
    } catch (error: any) {
      addTestResult(`❌ Sign in failed: ${error.message}`);
    }
  };

  const handleSignUp = async () => {
    try {
      addTestResult('🧪 Attempting sign up...');
      await signUp(email, password, username);
      addTestResult('✅ Sign up successful');
    } catch (error: any) {
      addTestResult(`❌ Sign up failed: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      addTestResult('🧪 Attempting sign out...');
      await signOutUser();
      addTestResult('✅ Sign out successful');
    } catch (error: any) {
      addTestResult(`❌ Sign out failed: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Firebase Auth Test</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIndicator, { backgroundColor: user ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.statusText}>
              🔐 {user ? 'LOGGED IN' : 'NOT LOGGED IN'}
            </Text>
          </View>
          {user && (
            <Text style={styles.userInfo}>
              Welcome, {user.name || user.email || 'User'}!
            </Text>
          )}
        </View>

        {/* Test Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Test Controls</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="test@example.com"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="password123"
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username:</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="testuser"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {user && (
            <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.button, styles.testButton]} onPress={runTests}>
            <Text style={styles.buttonText}>Run Tests</Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={styles.resultsContainer}>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/welcome')}>
            <Text style={styles.navButtonText}>Back to Welcome</Text>
          </TouchableOpacity>
          
          {user && (
            <TouchableOpacity style={styles.navButton} onPress={() => router.push('/postLoginWelcome')}>
              <Text style={styles.navButtonText}>Go to App</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  controlsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6A1B9A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  signOutButton: {
    backgroundColor: '#D32F2F',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#1976D2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  resultsContainer: {
    maxHeight: 200,
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});



