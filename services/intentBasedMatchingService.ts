import { Alert } from 'react-native';
import { IntentType } from '@/components/ui/IntentSelectionBottomSheet';

export interface MatchResult {
    matched: boolean;
    partnerName?: string;
    partnerId?: string;
    intentType?: IntentType;
    eventId?: string;
    eventTitle?: string;
}

class IntentBasedMatchingService {
    // Check if two users have compatible intents
    private areIntentsCompatible(intent1: IntentType, intent2: IntentType): boolean {
        // Either user can match with "Either" intent
        if (intent1 === IntentType.Either || intent2 === IntentType.Either) {
            return true;
        }
        
        // Same intent types are compatible
        if (intent1 === intent2) {
            return true;
        }
        
        // Romantic and Group are not compatible with each other
        return false;
    }

    // Simulate finding a compatible partner (in real app, this would query Firestore)
    private async findCompatiblePartner(
        userId: string, 
        eventId: string, 
        userIntent: IntentType
    ): Promise<{ partnerId: string; partnerName: string; partnerIntent: IntentType } | null> {
        // Mock data - in real app, this would query Firestore for users interested in the same event
        const mockPartners = [
            { id: 'partner1', name: 'Sarah Johnson', intent: IntentType.Romantic },
            { id: 'partner2', name: 'Mike Chen', intent: IntentType.Group },
            { id: 'partner3', name: 'Emma Davis', intent: IntentType.Either },
            { id: 'partner4', name: 'Alex Rodriguez', intent: IntentType.Romantic },
        ];

        // Find a compatible partner
        for (const partner of mockPartners) {
            if (partner.id !== userId && this.areIntentsCompatible(userIntent, partner.intent)) {
                return {
                    partnerId: partner.id,
                    partnerName: partner.name,
                    partnerIntent: partner.intent
                };
            }
        }

        return null;
    }

    // Main matching function
    async checkForMatch(
        userId: string,
        eventId: string,
        eventTitle: string,
        userIntent: IntentType
    ): Promise<MatchResult> {
        try {
            Alert.alert('🧪 Matching Check', `Checking for match with intent: ${userIntent}`);
            
            const compatiblePartner = await this.findCompatiblePartner(userId, eventId, userIntent);
            
            if (compatiblePartner) {
                Alert.alert('🎉 Match Found!', `You matched with ${compatiblePartner.partnerName}!`);
                
                return {
                    matched: true,
                    partnerName: compatiblePartner.partnerName,
                    partnerId: compatiblePartner.partnerId,
                    intentType: userIntent,
                    eventId,
                    eventTitle
                };
            } else {
                Alert.alert('💭 No Match Yet', 'No compatible partner found yet. Keep looking!');
                
                return {
                    matched: false,
                    intentType: userIntent,
                    eventId,
                    eventTitle
                };
            }
        } catch (error) {
            Alert.alert('❌ Matching Error', `Error checking for match: ${error}`);
            
            return {
                matched: false,
                intentType: userIntent,
                eventId,
                eventTitle
            };
        }
    }

    // Save user intent to Firestore
    async saveUserIntent(
        userId: string,
        eventId: string,
        intentType: IntentType
    ): Promise<void> {
        try {
            Alert.alert('🧪 Saving Intent', `Saving intent ${intentType} for event ${eventId}`);
            
            // Import Firebase modules
            const { db } = await import('@/config/firebase');
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            
            // Save to Firestore subcollection: users/{userId}/interested_events/{eventId}
            const eventDocRef = doc(db, 'users', userId, 'interested_events', eventId);
            await setDoc(eventDocRef, {
                eventId,
                intentType,
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            
            console.log('🧪 Intent saved successfully to Firestore');
        } catch (error) {
            Alert.alert('❌ Save Error', `Error saving intent: ${error}`);
            throw error;
        }
    }
}

// Export singleton instance
export const intentBasedMatchingService = new IntentBasedMatchingService();
export default intentBasedMatchingService;
