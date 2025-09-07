import { useAuth } from '@/contexts/AuthContext';
import { bilateralMatchingService } from '@/services/bilateralMatchingService';
import { useCallback, useEffect, useState } from 'react';

/**
 * 🧪 Real-time interest state hook
 * Automatically syncs UI with Firestore interest state changes
 */
export const useInterestState = (eventId: string | number) => {
  const { user } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🧪 Check initial interest state
  useEffect(() => {
    if (!user) {
      console.log('🧪 useInterestState: No user, setting interested to false');
      setIsInterested(false);
      return;
    }

    const checkInitialState = async () => {
      try {
        setIsLoading(true);
        console.log('🧪 useInterestState: Checking initial state for event', eventId, 'user:', user.id);
        const interested = await bilateralMatchingService.isInterested(user.id, String(eventId));
        console.log('🧪 useInterestState: Initial state result:', interested);
        setIsInterested(interested);
      } catch (error) {
        console.error('🧪 useInterestState: Error checking initial state:', error);
        setIsInterested(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialState();
  }, [user, eventId]);

  // 🧪 Set up real-time listener
  useEffect(() => {
    if (!user) {
      console.log('🧪 useInterestState: No user for real-time listener, skipping');
      return;
    }

    console.log('🧪 useInterestState: Setting up real-time listener for event', eventId, 'user:', user.id);
    
    const unsubscribe = bilateralMatchingService.watchInterest(
      user.id,
      String(eventId),
      (interested) => {
        console.log('🧪 useInterestState: Real-time update for event', eventId, '=', interested);
        setIsInterested(interested);
      }
    );

    return () => {
      console.log('🧪 useInterestState: Cleaning up listener for event', eventId);
      unsubscribe();
    };
  }, [user, eventId]);

  // 🧪 Toggle interest state
  const toggleInterest = useCallback(async () => {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      console.log('🧪 useInterestState: Toggling interest for event', eventId);
      
      if (isInterested) {
        await bilateralMatchingService.unmarkInterest(user.id, String(eventId));
        console.log('🧪 useInterestState: Interest removed for event', eventId);
      } else {
        // This will be handled by the eventsApiService.markInterestInEvent
        // The real-time listener will pick up the change
        console.log('🧪 useInterestState: Interest will be added by API service for event', eventId);
      }
    } catch (error) {
      console.error('🧪 useInterestState: Error toggling interest:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, isInterested, isLoading]);

  return {
    isInterested,
    isLoading,
    toggleInterest
  };
};
