import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock event data
const mockEvents = [
  {
    id: '1',
    title: 'Salsa Social Night',
    instructor: 'Maria Rodriguez',
    location: 'Dance Studio Downtown',
    date: '2024-01-15',
    time: '8:00 PM',
    price: '$25',
  },
  {
    id: '2',
    title: 'Bachata Workshop',
    instructor: 'Carlos Mendez',
    location: 'Latin Dance Academy',
    date: '2024-01-20',
    time: '2:00 PM',
    price: '$40',
  },
  {
    id: '3',
    title: 'Kizomba Party',
    instructor: 'Ana Silva',
    location: 'African Dance Center',
    date: '2024-01-25',
    time: '9:00 PM',
    price: '$30',
  },
];

export default function EventListScreen() {
  const renderEvent = ({ item }: { item: typeof mockEvents[0] }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => router.push(`/eventDetail/${item.title}/${item.instructor}/${item.location}`)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventPrice}>{item.price}</Text>
      </View>
      
      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>{item.instructor}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{item.date} at {item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dance Events</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#4A148C" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={mockEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  searchButton: {
    padding: 8,
  },
  eventList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  eventPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
});



