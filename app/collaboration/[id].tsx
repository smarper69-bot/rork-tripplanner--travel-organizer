import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Image, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, Send, UserPlus, ThumbsUp, ThumbsDown, 
  MessageCircle, Crown, Edit3, Eye, MoreVertical
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockTrips, mockComments } from '@/mocks/trips';
import { Collaborator, GroupComment } from '@/types/trip';

export default function CollaborationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'votes'>('chat');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<GroupComment[]>(mockComments);

  const trip = mockTrips.find(t => t.id === id);

  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Trip not found</Text>
      </View>
    );
  }

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const comment: GroupComment = {
      id: Date.now().toString(),
      tripId: trip.id,
      userId: '1',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      content: newComment,
      timestamp: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return <Crown size={14} color={Colors.secondary} />;
      case 'editor': return <Edit3 size={14} color={Colors.primary} />;
      case 'viewer': return <Eye size={14} color={Colors.textMuted} />;
    }
  };

  const getRoleLabel = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'editor': return 'Can edit';
      case 'viewer': return 'View only';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.membersHeader}>
        <Text style={styles.membersCount}>{trip.collaborators.length} members</Text>
        <TouchableOpacity style={styles.inviteButton}>
          <UserPlus size={18} color={Colors.textLight} />
          <Text style={styles.inviteButtonText}>Invite</Text>
        </TouchableOpacity>
      </View>
      
      {trip.collaborators.map((member) => (
        <View key={member.id} style={styles.memberCard}>
          <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <View style={styles.memberRole}>
              {getRoleIcon(member.role)}
              <Text style={styles.memberRoleText}>{getRoleLabel(member.role)}</Text>
            </View>
          </View>
          {member.role !== 'owner' && (
            <TouchableOpacity style={styles.memberOptions}>
              <MoreVertical size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={styles.pendingSection}>
        <Text style={styles.pendingTitle}>Pending Invites</Text>
        <View style={styles.emptyPending}>
          <Text style={styles.emptyPendingText}>No pending invitations</Text>
        </View>
      </View>
    </View>
  );

  const renderChatTab = () => (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={150}
    >
      <ScrollView 
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {comments.filter(c => c.tripId === trip.id).map((comment) => {
          const isMe = comment.userId === '1';
          return (
            <View 
              key={comment.id} 
              style={[styles.commentContainer, isMe && styles.commentContainerMe]}
            >
              {!isMe && (
                <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
              )}
              <View style={[styles.commentBubble, isMe && styles.commentBubbleMe]}>
                {!isMe && <Text style={styles.commentAuthor}>{comment.userName}</Text>}
                <Text style={[styles.commentText, isMe && styles.commentTextMe]}>
                  {comment.content}
                </Text>
                <Text style={[styles.commentTime, isMe && styles.commentTimeMe]}>
                  {formatTime(comment.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleSendComment}
          disabled={!newComment.trim()}
        >
          <Send size={20} color={newComment.trim() ? Colors.textLight : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderVotesTab = () => {
    const activities = trip.itinerary.flatMap(day => day.activities);
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.votesDescription}>
          Vote on activities to help the group decide what to do!
        </Text>
        
        {activities.length > 0 ? (
          activities.slice(0, 5).map((activity) => (
            <View key={activity.id} style={styles.voteCard}>
              <View style={styles.voteInfo}>
                <Text style={styles.voteTitle}>{activity.title}</Text>
                <Text style={styles.voteLocation}>{activity.location || 'No location'}</Text>
              </View>
              <View style={styles.voteButtons}>
                <TouchableOpacity style={styles.voteButton}>
                  <ThumbsUp size={18} color={Colors.success} />
                  <Text style={styles.voteCount}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.voteButton}>
                  <ThumbsDown size={18} color={Colors.accent} />
                  <Text style={styles.voteCount}>0</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyVotes}>
            <Text style={styles.emptyVotesText}>No activities to vote on yet</Text>
            <Text style={styles.emptyVotesSubtext}>Add activities to your itinerary first</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Group Planning</Text>
            <Text style={styles.subtitle}>{trip.name}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'members' && styles.tabActive]}
            onPress={() => setActiveTab('members')}
          >
            <UserPlus size={18} color={activeTab === 'members' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
              Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <MessageCircle size={18} color={activeTab === 'chat' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
              Chat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'votes' && styles.tabActive]}
            onPress={() => setActiveTab('votes')}
          >
            <ThumbsUp size={18} color={activeTab === 'votes' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'votes' && styles.tabTextActive]}>
              Votes
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'votes' && renderVotesTab()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  memberRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberRoleText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  memberOptions: {
    padding: 8,
  },
  pendingSection: {
    marginTop: 24,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  emptyPending: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyPendingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  chatContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  commentContainerMe: {
    justifyContent: 'flex-end',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentBubble: {
    maxWidth: '75%',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  commentBubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  commentTextMe: {
    color: Colors.textLight,
  },
  commentTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  commentTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  votesDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  voteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  voteInfo: {
    flex: 1,
  },
  voteTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  voteLocation: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyVotes: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyVotesText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyVotesSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
