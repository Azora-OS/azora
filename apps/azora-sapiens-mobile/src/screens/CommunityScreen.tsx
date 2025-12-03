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
  Alert,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ubuntuApi } from '../services/api';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    ubuntuScore: number;
  };
  content: string;
  type: 'update' | 'question' | 'achievement' | 'collaboration';
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
  tags: string[];
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
  }>;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'workshop' | 'meetup' | 'webinar' | 'community-service';
  attendees: number;
  maxAttendees?: number;
  registered: boolean;
  organizer: string;
}

export default function CommunityScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'members'>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'posts') {
        const response = await ubuntuApi.get('/community/posts');
        setPosts(response.data.posts || []);
      } else if (activeTab === 'events') {
        const response = await ubuntuApi.get('/community/events');
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      Alert.alert('Error', 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter post content');
      return;
    }

    try {
      await ubuntuApi.post('/community/posts', {
        content: newPostContent,
        type: 'update'
      });

      setNewPostContent('');
      setShowNewPost(false);
      loadData();
      Alert.alert('Success', 'Post shared with Ubuntu community!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const likePost = async (postId: string) => {
    try {
      await ubuntuApi.post(`/community/posts/${postId}/like`);
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      await ubuntuApi.post(`/community/events/${eventId}/register`);
      
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, registered: true, attendees: event.attendees + 1 }
            : event
        )
      );
      
      Alert.alert('Success', 'Registered for Ubuntu community event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', 'Failed to register for event');
    }
  };

  const renderPostItem = ({ item }: { item: CommunityPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarText}>
              {item.author.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <View style={styles.authorMeta}>
              <Text style={styles.ubuntuScore}>Ubuntu {item.author.ubuntuScore}</Text>
              <Text style={styles.postTime}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.postTypeBadge, styles[item.type]}>
          <Text style={styles.postTypeText}>{item.type}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={[styles.actionButton, item.liked && styles.likedButton]}
          onPress={() => likePost(item.id)}
        >
          <Text style={[styles.actionButtonText, item.liked && styles.likedButtonText]}>
            {item.liked ? '❤️' : '🤍'} {item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>💬 {item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>🔄 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEventItem = ({ item }: { item: CommunityEvent }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={[styles.eventTypeBadge, styles[item.type]]}>
          <Text style={styles.eventTypeText}>{item.type}</Text>
        </View>
      </View>

      <Text style={styles.eventDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.eventDetails}>
        <Text style={styles.eventDetail}>📅 {new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.eventDetail}>📍 {item.location}</Text>
        <Text style={styles.eventDetail}>👥 {item.attendees} attending</Text>
        {item.maxAttendees && (
          <Text style={styles.eventDetail}>
            📊 {item.maxAttendees - item.attendees} spots left
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.registerButton,
          item.registered && styles.registeredButton
        ]}
        onPress={() => registerForEvent(item.id)}
        disabled={item.registered}
      >
        <Text style={[
          styles.registerButtonText,
          item.registered && styles.registeredButtonText
        ]}>
          {item.registered ? '✅ Registered' : 'Register Now'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNewPost = () => (
    <View style={styles.newPostContainer}>
      <TextInput
        style={styles.newPostInput}
        placeholder="Share your Ubuntu journey with the community..."
        multiline
        value={newPostContent}
        onChangeText={setNewPostContent}
        textAlignVertical="top"
      />
      <View style={styles.newPostActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setShowNewPost(false);
            setNewPostContent('');
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={createPost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabButton = (tab: typeof activeTab, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B4F6F" />
        <Text style={styles.loadingText}>Loading Ubuntu community...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ubuntu Community</Text>
        <Text style={styles.headerSubtitle}>Connect, collaborate, and grow together</Text>
      </View>

      <View style={styles.tabsContainer}>
        {renderTabButton('posts', 'Posts')}
        {renderTabButton('events', 'Events')}
        {renderTabButton('members', 'Members')}
      </View>

      {activeTab === 'posts' && (
        <View style={styles.postsContainer}>
          {showNewPost && renderNewPost()}
          
          {!showNewPost && (
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => setShowNewPost(true)}
            >
              <Text style={styles.createPostButtonText}>+ Create Post</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.postsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Be the first to share with the Ubuntu community!</Text>
              </View>
            }
          />
        </View>
      )}

      {activeTab === 'events' && (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.eventsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No upcoming events</Text>
              <Text style={styles.emptySubtext}>Check back soon for Ubuntu community events!</Text>
            </View>
          }
        />
      )}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B4F6F',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#3B4F6F',
    fontWeight: 'bold',
  },
  postsContainer: {
    flex: 1,
  },
  createPostButton: {
    margin: 16,
    backgroundColor: '#3B4F6F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newPostContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newPostInput: {
    height: 100,
    fontSize: 16,
    marginBottom: 12,
  },
  newPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#3B4F6F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsList: {
    padding: 16,
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B4F6F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ubuntuScore: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 8,
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  update: {
    backgroundColor: '#E3F2FD',
  },
  question: {
    backgroundColor: '#FFF3E0',
  },
  achievement: {
    backgroundColor: '#E8F5E8',
  },
  collaboration: {
    backgroundColor: '#F3E5F5',
  },
  postTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likedButton: {
    // Visual feedback for liked state
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  likedButtonText: {
    color: '#F44336',
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B4F6F',
    flex: 1,
    marginRight: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workshop: {
    backgroundColor: '#E3F2FD',
  },
  meetup: {
    backgroundColor: '#FFF3E0',
  },
  webinar: {
    backgroundColor: '#E8F5E8',
  },
  'community-service': {
    backgroundColor: '#F3E5F5',
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: '#3B4F6F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: '#4CAF50',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registeredButtonText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
