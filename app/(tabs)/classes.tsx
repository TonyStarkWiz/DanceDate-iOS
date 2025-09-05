import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ClassesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dance Classes</Text>
        <Text style={styles.subtitle}>Find and join dance classes near you</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Classes</Text>
          
          <TouchableOpacity style={styles.classCard}>
            <View style={styles.classHeader}>
              <Text style={styles.classTitle}>Beginner Salsa</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Beginner</Text>
              </View>
            </View>
            <Text style={styles.classInstructor}>with Maria Rodriguez</Text>
            <Text style={styles.classTime}>Every Tuesday & Thursday 7:00 PM</Text>
            <Text style={styles.classLocation}>📍 Downtown Dance Studio</Text>
            <View style={styles.classFooter}>
              <Text style={styles.classPrice}>$25/class</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Class</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.classCard}>
            <View style={styles.classHeader}>
              <Text style={styles.classTitle}>Bachata Fundamentals</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Intermediate</Text>
              </View>
            </View>
            <Text style={styles.classInstructor}>with Carlos Mendez</Text>
            <Text style={styles.classTime}>Every Monday & Wednesday 8:00 PM</Text>
            <Text style={styles.classLocation}>📍 Latin Dance Academy</Text>
            <View style={styles.classFooter}>
              <Text style={styles.classPrice}>$30/class</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Class</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.classCard}>
            <View style={styles.classHeader}>
              <Text style={styles.classTitle}>Ballroom Basics</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>All Levels</Text>
              </View>
            </View>
            <Text style={styles.classInstructor}>with James & Sarah</Text>
            <Text style={styles.classTime}>Every Saturday 2:00 PM</Text>
            <Text style={styles.classLocation}>📍 Elegant Ballroom Studio</Text>
            <View style={styles.classFooter}>
              <Text style={styles.classPrice}>$35/class</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join Class</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Class Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Style</Text>
          
          <View style={styles.categoryGrid}>
            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="musical-notes" size={32} color="#6A11CB" />
              <Text style={styles.categoryTitle}>Salsa</Text>
              <Text style={styles.categoryCount}>12 classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="heart" size={32} color="#6A11CB" />
              <Text style={styles.categoryTitle}>Bachata</Text>
              <Text style={styles.categoryCount}>8 classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="trophy" size={32} color="#6A11CB" />
              <Text style={styles.categoryTitle}>Ballroom</Text>
              <Text style={styles.categoryCount}>15 classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Ionicons name="flame" size={32} color="#6A11CB" />
              <Text style={styles.categoryTitle}>Tango</Text>
              <Text style={styles.categoryCount}>6 classes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Search Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="location" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Near Me</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>My Schedule</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  classCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  levelBadge: {
    backgroundColor: '#6A11CB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  classInstructor: {
    fontSize: 14,
    color: '#6A11CB',
    fontWeight: '600',
    marginBottom: 5,
  },
  classTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  classLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  joinButton: {
    backgroundColor: '#6A11CB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#6A11CB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});
