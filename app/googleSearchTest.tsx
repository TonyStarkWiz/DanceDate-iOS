import { testGoogleCustomSearch, testGoogleCustomSearchCredentials } from '@/services/googleCustomSearchService';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GoogleSearchTestScreen() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [credentialsTest, setCredentialsTest] = useState<any>(null);

  const testCredentials = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Google Custom Search credentials...');
      const result = await testGoogleCustomSearchCredentials();
      setCredentialsTest(result);
      
      if (result.apiKeyValid && result.searchEngineIdValid) {
        Alert.alert('✅ Credentials Valid', 'Your Google Custom Search API credentials are working!');
      } else {
        Alert.alert('❌ Credentials Invalid', `Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('🧪 Credential test error:', error);
      Alert.alert('❌ Test Failed', 'Failed to test credentials');
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Google Custom Search functionality...');
      const result = await testGoogleCustomSearch();
      setTestResults(result);
      
      if (result.success) {
        Alert.alert('✅ Search Test Successful', `Found ${result.results?.length || 0} results!`);
      } else {
        Alert.alert('❌ Search Test Failed', `Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('🧪 Search test error:', error);
      Alert.alert('❌ Test Failed', 'Failed to test search functionality');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Google Custom Search Test</Text>
        <Text style={styles.subtitle}>Check if your search integration is working</Text>
      </View>

      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>1. Test API Credentials</Text>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testCredentials}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Credentials'}
          </Text>
        </TouchableOpacity>
        
        {credentialsTest && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Credentials Test Results:</Text>
            <Text style={styles.resultText}>
              API Key Valid: {credentialsTest.apiKeyValid ? '✅' : '❌'}
            </Text>
            <Text style={styles.resultText}>
              Search Engine ID Valid: {credentialsTest.searchEngineIdValid ? '✅' : '❌'}
            </Text>
            {credentialsTest.apiKey && (
              <Text style={styles.resultText}>
                API Key: {credentialsTest.apiKey}
              </Text>
            )}
            {credentialsTest.searchEngineId && (
              <Text style={styles.resultText}>
                Search Engine ID: {credentialsTest.searchEngineId}
              </Text>
            )}
            {credentialsTest.error && (
              <Text style={[styles.resultText, styles.errorText]}>
                Error: {credentialsTest.error}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>2. Test Search Functionality</Text>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Searching...' : 'Test Search'}
          </Text>
        </TouchableOpacity>
        
        {testResults && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Search Test Results:</Text>
            <Text style={styles.resultText}>
              Success: {testResults.success ? '✅' : '❌'}
            </Text>
            {testResults.results && (
              <Text style={styles.resultText}>
                Results Found: {testResults.results.length}
              </Text>
            )}
            {testResults.results && testResults.results.length > 0 && (
              <View style={styles.resultsList}>
                <Text style={styles.resultsTitle}>Sample Results:</Text>
                {testResults.results.slice(0, 3).map((result: any, index: number) => (
                  <View key={index} style={styles.resultItem}>
                    <Text style={styles.resultItemTitle}>{result.title}</Text>
                    <Text style={styles.resultItemSource}>Source: {result.source}</Text>
                  </View>
                ))}
              </View>
            )}
            {testResults.error && (
              <Text style={[styles.resultText, styles.errorText]}>
                Error: {testResults.error}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Troubleshooting Tips:</Text>
        <Text style={styles.infoText}>
          • Check if your API key is valid and has Custom Search API enabled
        </Text>
        <Text style={styles.infoText}>
          • Verify your Search Engine ID is correct
        </Text>
        <Text style={styles.infoText}>
          • Ensure you haven't exceeded daily quota limits
        </Text>
        <Text style={styles.infoText}>
          • Check console logs for detailed error messages
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  testSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#4A148C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4A148C',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  errorText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  resultsList: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultItemSource: {
    fontSize: 12,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 5,
    lineHeight: 20,
  },
});
