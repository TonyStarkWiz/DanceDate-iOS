import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Intent types matching your Android enum
export enum IntentType {
    Romantic = 'romantic',
    Group = 'group', 
    Either = 'either'
}

interface IntentSelectionBottomSheetProps {
    visible: boolean;
    onIntentSelected: (intentType: IntentType) => void;
    onDismiss: () => void;
}

export const IntentSelectionBottomSheet: React.FC<IntentSelectionBottomSheetProps> = ({
    visible,
    onIntentSelected,
    onDismiss
}) => {
    const handleIntentSelection = (intentType: IntentType) => {
        Alert.alert('🧪 Intent Selected', `IntentType.${intentType} selected`);
        onIntentSelected(intentType);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <View style={styles.bottomSheet}>
                    <View style={styles.handle} />
                    
                    <View style={styles.content}>
                        <Text style={styles.title}>
                            What kind of partner are you looking for?
                        </Text>
                        
                        <View style={styles.spacer} />
                        
                        {/* Romantic Intent Button */}
                        <Pressable
                            style={[styles.intentButton, styles.romanticButton]}
                            onPress={() => handleIntentSelection(IntentType.Romantic)}
                        >
                            <Text style={styles.buttonText}>Romantic 💞</Text>
                        </Pressable>
                        
                        {/* Dance Only Intent Button */}
                        <Pressable
                            style={[styles.intentButton, styles.danceOnlyButton]}
                            onPress={() => handleIntentSelection(IntentType.Group)}
                        >
                            <Text style={styles.buttonText}>Dance Only 🕺</Text>
                        </Pressable>
                        
                        {/* Either/All Intent Button */}
                        <Pressable
                            style={[styles.intentButton, styles.eitherButton]}
                            onPress={() => handleIntentSelection(IntentType.Either)}
                        >
                            <Text style={styles.buttonText}>Either / All 🤝</Text>
                        </Pressable>
                        
                        <View style={styles.spacer} />
                        
                        {/* Cancel Button */}
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onDismiss}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#000',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34, // Safe area for iPhone
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#666',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    spacer: {
        height: 12,
    },
    intentButton: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 4,
        alignItems: 'center',
    },
    romanticButton: {
        backgroundColor: '#D81B60',
    },
    danceOnlyButton: {
        backgroundColor: '#3949AB',
    },
    eitherButton: {
        backgroundColor: '#00897B',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});
