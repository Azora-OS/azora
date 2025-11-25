import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function UsersScreen() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/enterprise/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUserAction = (userId: string, action: string) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => performUserAction(userId, action) }
      ]
    );
  };

  const performUserAction = async (userId: string, action: string) => {
    try {
      await api.post(`/enterprise/users/${userId}/${action}`);
      loadUsers(); // Refresh list
      Alert.alert('Success', `User ${action} successfully`);
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} user`);
    }
  };

  const filters = [
    { key: 'all', label: 'All Users' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'pending', label: 'Pending' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>{filteredUsers.length} users</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, selectedFilter === filter.key && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[styles.filterButtonText, selectedFilter === filter.key && styles.filterButtonTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.usersList}>
        {filteredUsers.map((user: any) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name || 'Unknown User'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userMeta}>
                  <Text style={[styles.userStatus, { color: getStatusColor(user.status) }]}>
                    {user.status || 'active'}
                  </Text>
                  <Text style={styles.userJoined}>
                    Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.userActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleUserAction(user.id, 'suspend')}
              >
                <Text style={styles.actionButtonText}>⏸️</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleUserAction(user.id, 'delete')}
              >
                <Text style={styles.actionButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No users found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return '#4CAF50';
    case 'inactive': return '#F44336';
    case 'pending': return '#FF9800';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#3B4F6F' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.8, marginTop: 4 },
  searchContainer: { padding: 16 },
  searchInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#e1e5e9' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e1e5e9' },
  filterButtonActive: { backgroundColor: '#3B4F6F', borderColor: '#3B4F6F' },
  filterButtonText: { fontSize: 14, fontWeight: '500', color: '#666' },
  filterButtonTextActive: { color: '#fff' },
  usersList: { flex: 1 },
  userCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3B4F6F', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#666', marginBottom: 4 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userStatus: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  userJoined: { fontSize: 12, color: '#999' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontSize: 16 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center' }
});