import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ubuntuApi } from '../services/api';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  postedAt: string;
  ubuntuScore: number;
  applicationsCount: number;
  companyLogo?: string;
}

export default function JobsScreen() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const jobTypes = ['all', 'remote', 'hybrid', 'onsite', 'freelance'];

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedType]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await ubuntuApi.get('/jobs/listings');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    setFilteredJobs(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const applyForJob = async (jobId: string) => {
    try {
      await ubuntuApi.post('/jobs/apply', { jobId });
      Alert.alert('Success', 'Application submitted successfully!');
      
      // Update job to show user has applied
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, applicationsCount: job.applicationsCount + 1 }
            : job
        )
      );
    } catch (error) {
      console.error('Error applying for job:', error);
      Alert.alert('Error', 'Failed to submit application');
    }
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.companyInfo}>
          {item.companyLogo && (
            <Image source={{ uri: item.companyLogo }} style={styles.companyLogo} />
          )}
          <View style={styles.companyDetails}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company}</Text>
            <Text style={styles.location}>📍 {item.location}</Text>
          </View>
        </View>
        <View style={styles.ubuntuScore}>
          <Text style={styles.ubuntuScoreText}>{item.ubuntuScore}</Text>
          <Text style={styles.ubuntuScoreLabel}>Ubuntu</Text>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.jobMeta}>
          <Text style={styles.salary}>💰 {item.salary}</Text>
          <Text style={styles.jobType}>{item.type}</Text>
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.requirements}>
          Requirements: {item.requirements.slice(0, 2).join(', ')}
          {item.requirements.length > 2 && '...'}
        </Text>
      </View>

      <View style={styles.jobFooter}>
        <Text style={styles.postedDate}>
          Posted {new Date(item.postedAt).toLocaleDateString()}
        </Text>
        <Text style={styles.applicationsCount}>
          {item.applicationsCount} applications
        </Text>
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => applyForJob(item.id)}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderJobTypeFilter = (type: string) => (
    <TouchableOpacity
      key={type}
      style={[
        styles.typeFilter,
        selectedType === type && styles.typeFilterActive
      ]}
      onPress={() => setSelectedType(type)}
    >
      <Text style={[
        styles.typeFilterText,
        selectedType === type && styles.typeFilterTextActive
      ]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B4F6F" />
        <Text style={styles.loadingText}>Loading Ubuntu opportunities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ubuntu Jobs</Text>
        <Text style={styles.headerSubtitle}>Find opportunities that align with community values</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, companies, or keywords..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {jobTypes.map(renderJobTypeFilter)}
        </ScrollView>
      </View>

      <FlatList
        data={filteredJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.jobsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B4F6F',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  typeFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  typeFilterActive: {
    backgroundColor: '#3B4F6F',
  },
  typeFilterText: {
    fontSize: 14,
    color: '#666',
  },
  typeFilterTextActive: {
    color: '#FFFFFF',
  },
  jobsList: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  companyDetails: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B4F6F',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
  ubuntuScore: {
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ubuntuScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ubuntuScoreLabel: {
    fontSize: 10,
    color: '#4CAF50',
  },
  jobDetails: {
    marginBottom: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  salary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  jobType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  requirements: {
    fontSize: 12,
    color: '#666',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postedDate: {
    fontSize: 12,
    color: '#999',
  },
  applicationsCount: {
    fontSize: 12,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#3B4F6F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
