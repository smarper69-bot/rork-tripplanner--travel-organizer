import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Image, KeyboardAvoidingView, Platform,
  Modal, Share, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, Send, UserPlus, ThumbsUp, ThumbsDown, 
  MessageCircle, Crown, Edit3, Eye, MoreVertical,
  Link2, Copy, Share2, X, Check, Activity,
  Plus, Trash2, Hotel, Camera, DollarSign, UserMinus
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { mockTrips, mockComments } from '@/mocks/trips';
import { useTripsStore } from '@/store/useTripsStore';
import { Collaborator, GroupComment, ActivityLogEntry } from '@/types/trip';
import { ThemeColors } from '@/constants/themes';
import { hapticSelection } from '@/utils/haptics';

export default function CollaborationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'votes' | 'activity'>('chat');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<GroupComment[]>(mockComments);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const storeTrips = useTripsStore((s) => s.trips);
  const generateInviteLink = useTripsStore((s) => s.generateInviteLink);
  const removeCollaborator = useTripsStore((s) => s.removeCollaborator);
  const getActivityLog = useTripsStore((s) => s.getActivityLog);

  const storedTrip = storeTrips.find(t => t.id === id);
  const trip = storedTrip || mockTrips.find(t => t.id === id);

  const activityLog = useMemo(() => id ? getActivityLog(id) : [], [id, getActivityLog]);

  const s = useMemo(() => createStyles(colors), [colors]);

  if (!trip) {
    return (
      <View style={s.notFound}>
        <Text style={s.notFoundText}>Trip not found</Text>
      </View>
    );
  }

  const getInviteLink = () => {
    if (!id) return '';
    return generateInviteLink(id);
  };

  const handleOpenShareModal = () => {
    setLinkCopied(false);
    setShareModalVisible(true);
  };

  const handleCopyLink = async () => {
    const link = getInviteLink();
    try {
      await Clipboard.setStringAsync(link);
      setLinkCopied(true);
      console.log('[Collaboration] Invite link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2500);
    } catch (e) {
      console.error('[Collaboration] Failed to copy:', e);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleShare = async () => {
    const link = getInviteLink();
    const tripName = trip?.name ?? 'a trip';
    try {
      await Share.share({
        message: Platform.OS === 'ios'
          ? `Join my trip "${tripName}" on TripNest!`
          : `Join my trip "${tripName}" on TripNest! ${link}`,
        url: Platform.OS === 'ios' ? link : undefined,
        title: `Join Trip: ${tripName}`,
      });
      console.log('[Collaboration] Share sheet opened');
    } catch (e) {
      console.error('[Collaboration] Share failed:', e);
    }
  };

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
      case 'owner': return <Crown size={14} color="#D97706" />;
      case 'editor': return <Edit3 size={14} color={colors.accent} />;
      case 'viewer': return <Eye size={14} color={colors.textMuted} />;
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

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLogActionText = (entry: ActivityLogEntry) => {
    switch (entry.action) {
      case 'joined': return 'joined the trip';
      case 'left': return 'left the trip';
      case 'added_activity': return `added "${entry.detail}"`;
      case 'removed_activity': return `removed "${entry.detail}"`;
      case 'added_stay': return `added stay "${entry.detail}"`;
      case 'removed_stay': return `removed stay "${entry.detail}"`;
      case 'updated_budget': return 'updated the budget';
      case 'added_memory': return 'added a photo';
      case 'removed_memory': return 'removed a photo';
      case 'updated_trip': return 'updated trip details';
      case 'invited': return `invited ${entry.detail ?? 'someone'}`;
      case 'removed_member': return `removed ${entry.detail ?? 'a member'}`;
      default: return 'made a change';
    }
  };

  const getLogActionIcon = (action: ActivityLogEntry['action']) => {
    switch (action) {
      case 'joined': return <UserPlus size={14} color="#059669" />;
      case 'left': return <UserMinus size={14} color="#EF4444" />;
      case 'added_activity': return <Plus size={14} color={colors.accent} />;
      case 'removed_activity': return <Trash2 size={14} color="#EF4444" />;
      case 'added_stay': return <Hotel size={14} color="#D97706" />;
      case 'removed_stay': return <Trash2 size={14} color="#EF4444" />;
      case 'updated_budget': return <DollarSign size={14} color="#059669" />;
      case 'added_memory': return <Camera size={14} color="#DB2777" />;
      case 'removed_memory': return <Trash2 size={14} color="#EF4444" />;
      case 'updated_trip': return <Edit3 size={14} color={colors.accent} />;
      case 'invited': return <UserPlus size={14} color={colors.accent} />;
      case 'removed_member': return <UserMinus size={14} color="#EF4444" />;
      default: return <Activity size={14} color={colors.textMuted} />;
    }
  };

  const renderMembersTab = () => (
    <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}>
      <View style={s.membersHeader}>
        <Text style={s.membersCount}>{trip.collaborators.length} members</Text>
        <TouchableOpacity style={s.inviteButton} onPress={handleOpenShareModal}>
          <UserPlus size={18} color="#fff" />
          <Text style={s.inviteButtonText}>Invite</Text>
        </TouchableOpacity>
      </View>
      
      {trip.collaborators.map((member) => (
        <View key={member.id} style={s.memberCard}>
          {member.avatar ? (
            <Image source={{ uri: member.avatar }} style={s.memberAvatar} />
          ) : (
            <View style={[s.memberAvatar, { backgroundColor: colors.borderLight, justifyContent: 'center' as const, alignItems: 'center' as const }]}>
              <UserPlus size={18} color={colors.textMuted} />
            </View>
          )}
          <View style={s.memberInfo}>
            <Text style={s.memberName}>{member.name}</Text>
            <View style={s.memberRole}>
              {getRoleIcon(member.role)}
              <Text style={s.memberRoleText}>{getRoleLabel(member.role)}</Text>
            </View>
          </View>
          {member.role !== 'owner' && storedTrip && (
            <TouchableOpacity style={s.memberOptions} onPress={() => {
              Alert.alert(
                'Remove Member',
                `Remove ${member.name} from this trip?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => removeCollaborator(storedTrip.id, member.id) },
                ]
              );
            }}>
              <MoreVertical size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={s.pendingSection}>
        <Text style={s.pendingTitle}>Pending Invites</Text>
        <View style={s.emptyPending}>
          <Text style={s.emptyPendingText}>No pending invitations</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderChatTab = () => (
    <KeyboardAvoidingView 
      style={s.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={150}
    >
      <ScrollView 
        style={s.chatScroll}
        contentContainerStyle={s.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {comments.filter(c => c.tripId === trip.id).map((comment) => {
          const isMe = comment.userId === '1';
          return (
            <View 
              key={comment.id} 
              style={[s.commentContainer, isMe && s.commentContainerMe]}
            >
              {!isMe && (
                <Image source={{ uri: comment.userAvatar }} style={s.commentAvatar} />
              )}
              <View style={[s.commentBubble, isMe && s.commentBubbleMe]}>
                {!isMe && <Text style={s.commentAuthor}>{comment.userName}</Text>}
                <Text style={[s.commentText, isMe && s.commentTextMe]}>
                  {comment.content}
                </Text>
                <Text style={[s.commentTime, isMe && s.commentTimeMe]}>
                  {formatTime(comment.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      <View style={s.chatInputContainer}>
        <TextInput
          style={s.chatInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[s.sendButton, !newComment.trim() && s.sendButtonDisabled]}
          onPress={handleSendComment}
          disabled={!newComment.trim()}
        >
          <Send size={20} color={newComment.trim() ? '#fff' : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderVotesTab = () => {
    const activities = trip.itinerary.flatMap(day => day.activities);
    
    return (
      <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={s.votesDescription}>
          Vote on activities to help the group decide what to do!
        </Text>
        
        {activities.length > 0 ? (
          activities.slice(0, 5).map((activity) => (
            <View key={activity.id} style={s.voteCard}>
              <View style={s.voteInfo}>
                <Text style={s.voteTitle}>{activity.title}</Text>
                <Text style={s.voteLocation}>{activity.location || 'No location'}</Text>
              </View>
              <View style={s.voteButtons}>
                <TouchableOpacity style={s.voteButton}>
                  <ThumbsUp size={18} color="#059669" />
                  <Text style={s.voteCount}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.voteButton}>
                  <ThumbsDown size={18} color="#EF4444" />
                  <Text style={s.voteCount}>0</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={s.emptyVotes}>
            <Text style={s.emptyVotesText}>No activities to vote on yet</Text>
            <Text style={s.emptyVotesSubtext}>Add activities to your itinerary first</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderActivityTab = () => (
    <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}>
      {activityLog.length > 0 ? (
        <View style={s.activityLogContainer}>
          {activityLog.slice(0, 50).map((entry) => (
            <View key={entry.id} style={s.activityLogItem}>
              <View style={s.activityLogIconWrap}>
                {getLogActionIcon(entry.action)}
              </View>
              <View style={s.activityLogContent}>
                <Text style={s.activityLogText}>
                  <Text style={s.activityLogUserName}>{entry.userName}</Text>
                  {' '}{getLogActionText(entry)}
                </Text>
                <Text style={s.activityLogTime}>{formatRelativeTime(entry.timestamp)}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={s.emptyVotes}>
          <Activity size={28} color={colors.textMuted} />
          <Text style={[s.emptyVotesText, { marginTop: 12 }]}>No activity yet</Text>
          <Text style={s.emptyVotesSubtext}>Changes by collaborators will appear here</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={s.headerContent}>
            <Text style={s.title}>Group Planning</Text>
            <Text style={s.subtitle}>{trip.name}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroller} contentContainerStyle={s.tabs}>
          {([
            { key: 'members' as const, icon: UserPlus, label: 'Members' },
            { key: 'chat' as const, icon: MessageCircle, label: 'Chat' },
            { key: 'votes' as const, icon: ThumbsUp, label: 'Votes' },
            { key: 'activity' as const, icon: Activity, label: 'Activity' },
          ]).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === tab.key && s.tabActive]}
              onPress={() => {
                hapticSelection();
                setActiveTab(tab.key);
              }}
            >
              <tab.icon size={16} color={activeTab === tab.key ? colors.accent : colors.textMuted} />
              <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'votes' && renderVotesTab()}
        {activeTab === 'activity' && renderActivityTab()}

        <Modal
          visible={shareModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setShareModalVisible(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Invite Travelers</Text>
                <TouchableOpacity
                  style={s.modalCloseButton}
                  onPress={() => setShareModalVisible(false)}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={s.inviteDesc}>
                Share this invite link. Anyone who opens it can join your trip as a collaborator.
              </Text>

              <View style={s.shareLinkContainer}>
                <Link2 size={18} color={colors.accent} />
                <Text style={s.shareLinkText} numberOfLines={1}>
                  {getInviteLink()}
                </Text>
              </View>

              <View style={s.shareActions}>
                <TouchableOpacity
                  style={[s.shareActionButton, linkCopied && s.shareActionButtonSuccess]}
                  onPress={handleCopyLink}
                >
                  {linkCopied ? (
                    <Check size={20} color="#fff" />
                  ) : (
                    <Copy size={20} color="#fff" />
                  )}
                  <Text style={s.shareActionText}>
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.shareActionButtonOutline}
                  onPress={handleShare}
                >
                  <Share2 size={20} color={colors.accent} />
                  <Text style={s.shareActionTextOutline}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabsScroller: {
    flexGrow: 0,
    marginBottom: 16,
  },
  tabs: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.accent + '18',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.accent,
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
    color: colors.textSecondary,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.accent,
    borderRadius: 10,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.borderLight,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  memberRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberRoleText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  memberOptions: {
    padding: 8,
  },
  pendingSection: {
    marginTop: 24,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  emptyPending: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyPendingText: {
    fontSize: 14,
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  commentBubbleMe: {
    backgroundColor: colors.accent,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.accent,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  commentTextMe: {
    color: '#fff',
  },
  commentTime: {
    fontSize: 11,
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
  votesDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  voteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  voteInfo: {
    flex: 1,
  },
  voteTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  voteLocation: {
    fontSize: 13,
    color: colors.textMuted,
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
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  emptyVotes: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  emptyVotesText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  emptyVotesSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityLogContainer: {
    gap: 2,
  },
  activityLogItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  activityLogIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityLogContent: {
    flex: 1,
    paddingTop: 2,
  },
  activityLogText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  activityLogUserName: {
    fontWeight: '600' as const,
    color: colors.text,
  },
  activityLogTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  shareLinkText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500' as const,
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.accent,
    borderRadius: 14,
  },
  shareActionButtonSuccess: {
    backgroundColor: '#2D9C5A',
  },
  shareActionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  shareActionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  shareActionTextOutline: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  inviteDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
});
