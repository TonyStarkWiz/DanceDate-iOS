import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Show nothing while loading
  }
  
  if (user) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/entry" />;
}