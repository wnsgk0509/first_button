import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyQuestion, getTodayKey } from '../constants/questions';
import { hasProfanity, maskProfanity } from '../services/cleanFilter';
import { loadJournalData } from '../services/storage';
import {
  fetchLiveCommunityPosts,
  PostWithMeta,
  publishLivePost,
  updateLivePostLikes,
} from '../services/supabaseService';

const LIKES_STORAGE_KEY = 'jamkkan_community_likes';
const BLOCKED_POSTS_KEY = 'jamkkan_blocked_posts';

type FeedFilter = 'today' | 'all';

export const CommunityScreen: React.FC = () => {
  const [question] = useState(getDailyQuestion());
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [filterMode, setFilterMode] = useState<FeedFilter>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSharedToday, setHasSharedToday] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const livePosts = await fetchLiveCommunityPosts();
      const likesRaw = await AsyncStorage.getItem(LIKES_STORAGE_KEY);
      const likedIds: string[] = likesRaw ? JSON.parse(likesRaw) : [];

      const blockedRaw = await AsyncStorage.getItem(BLOCKED_POSTS_KEY);
      const blockedIds: string[] = blockedRaw ? JSON.parse(blockedRaw) : [];

      // Filter out blocked posts
      const filtered = livePosts.filter(p => !blockedIds.includes(p.id));

      const mapped = filtered.map(p => ({
        ...p,
        text: maskProfanity(p.text),
        isUserLiked: likedIds.includes(p.id),
      }));

      setPosts(mapped);

      // Check if user shared today
      const today = getTodayKey();
      const sharedCheck = await AsyncStorage.getItem(`shared_community_${today}`);
      setHasSharedToday(!!sharedCheck);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const livePosts = await fetchLiveCommunityPosts();
      const likesRaw = await AsyncStorage.getItem(LIKES_STORAGE_KEY);
      const likedIds: string[] = likesRaw ? JSON.parse(likesRaw) : [];

      const blockedRaw = await AsyncStorage.getItem(BLOCKED_POSTS_KEY);
      const blockedIds: string[] = blockedRaw ? JSON.parse(blockedRaw) : [];

      const filtered = livePosts.filter(p => !blockedIds.includes(p.id));

      setPosts(
        filtered.map(p => ({
          ...p,
          text: maskProfanity(p.text),
          isUserLiked: likedIds.includes(p.id),
        }))
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const likesRaw = await AsyncStorage.getItem(LIKES_STORAGE_KEY);
      let likedIds: string[] = likesRaw ? JSON.parse(likesRaw) : [];

      const targetPost = posts.find(p => p.id === postId);
      if (!targetPost) return;

      const isLiked = likedIds.includes(postId);
      const nextLikes = isLiked
        ? Math.max(0, targetPost.likes - 1)
        : targetPost.likes + 1;

      if (isLiked) {
        likedIds = likedIds.filter(id => id !== postId);
      } else {
        likedIds.push(postId);
      }

      await AsyncStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedIds));

      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes: nextLikes,
              isUserLiked: !isLiked,
            };
          }
          return p;
        })
      );

      await updateLivePostLikes(postId, nextLikes);
    } catch (e) {
      console.warn('Like toggle failed', e);
    }
  };

  const handleReportPost = (postId: string) => {
    Alert.alert(
      '게시글 신고 및 숨김',
      '부적절하거나 불쾌감을 주는 내용이 포함되어 있나요? 신고 즉시 내 피드에서 숨겨지며 관리자에게 검토 요청됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '신고 및 숨김',
          style: 'destructive',
          onPress: async () => {
            try {
              const blockedRaw = await AsyncStorage.getItem(BLOCKED_POSTS_KEY);
              const blockedIds: string[] = blockedRaw ? JSON.parse(blockedRaw) : [];
              if (!blockedIds.includes(postId)) {
                blockedIds.push(postId);
                await AsyncStorage.setItem(
                  BLOCKED_POSTS_KEY,
                  JSON.stringify(blockedIds)
                );
              }
              setPosts(prev => prev.filter(p => p.id !== postId));
              Alert.alert('신고 접수 완료', '해당 게시글이 피드에서 숨김 처리되었습니다 🌿');
            } catch (err) {
              console.warn(err);
            }
          },
        },
      ]
    );
  };

  const handleShareMyAnswer = async () => {
    const data = await loadJournalData();
    const today = getTodayKey();
    const todayEntry = data.entries.find(e => e.date === today);

    if (!todayEntry || !todayEntry.text.trim()) {
      Alert.alert(
        '생각을 먼저 기록해 주세요',
        '오늘의 질문에 답변을 먼저 작성하신 후 익명으로 나누실 수 있습니다 🌿'
      );
      return;
    }

    if (hasSharedToday) {
      Alert.alert(
        '알림',
        '오늘의 생각은 이미 광장에 익명으로 공유되었습니다 ✦'
      );
      return;
    }

    // Clean Filter: 욕설 및 공격적 표현 검사
    if (hasProfanity(todayEntry.text)) {
      Alert.alert(
        '따뜻한 단어로 수정해 주세요',
        '차분한 성찰 광장을 위해 부적절하거나 공격적인 표현은 등록할 수 없습니다 🌿'
      );
      return;
    }

    const published = await publishLivePost(
      todayEntry.text.trim(),
      question,
      '익명의 나그네'
    );

    if (published) {
      setPosts(prev => [published, ...prev]);
      setHasSharedToday(true);
      await AsyncStorage.setItem(`shared_community_${today}`, '1');

      Alert.alert(
        '익명 공유 완료',
        '오늘의 솔직한 생각이 광장에 등록되었습니다. 다른 사람들에게 따뜻한 울림이 될 거예요 🌿'
      );
    } else {
      Alert.alert(
        '공유 실패',
        '인터넷 연결 상태를 확인하고 다시 시도해 주세요.'
      );
    }
  };

  const displayedPosts = filterMode === 'today'
    ? posts.filter(p => !p.question || p.question === question)
    : posts;

  const renderItem = ({ item }: { item: PostWithMeta }) => {
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.authorBadge}>
            <Text style={styles.authorIcon}>🌿</Text>
            <Text style={styles.authorName}>{item.author}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
            <TouchableOpacity
              style={styles.reportBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleReportPost(item.id)}>
              <Text style={styles.reportBtnText}>🚨 신고</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filterMode === 'all' && item.question && item.question !== question && (
          <Text style={styles.postQuestionRef}>Q. "{item.question}"</Text>
        )}

        <Text style={styles.postText}>{item.text}</Text>

        <View style={styles.postFooter}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.likeBtn, item.isUserLiked && styles.likeBtnActive]}
            onPress={() => handleToggleLike(item.id)}>
            <Text
              style={[
                styles.likeBtnText,
                item.isUserLiked && styles.likeBtnTextActive,
              ]}>
              {item.isUserLiked ? '🌱 공감됨' : '🌿 공감해요'} {item.likes}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Question Info */}
      <View style={styles.questionBanner}>
        <Text style={styles.bannerTag}>
          오늘 같은 질문을 마주한 사람들의 생각
        </Text>
        <Text style={styles.bannerQuestion}>"{question}"</Text>
      </View>

      {/* Share Action Pill */}
      <View style={styles.shareActionRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.shareActionBtn,
            hasSharedToday && styles.shareActionBtnDisabled,
          ]}
          onPress={handleShareMyAnswer}>
          <Text style={styles.shareActionText}>
            {hasSharedToday
              ? '✓ 오늘 내 생각 익명 공유됨'
              : '✍️ 내 오늘 답변도 익명으로 나누기'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs: 오늘 질문 피드 / 전체 피드 */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'today' && styles.filterBtnActive]}
          onPress={() => setFilterMode('today')}>
          <Text style={[styles.filterBtnText, filterMode === 'today' && styles.filterBtnTextActive]}>
            오늘 질문 피드
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'all' && styles.filterBtnActive]}
          onPress={() => setFilterMode('all')}>
          <Text style={[styles.filterBtnText, filterMode === 'all' && styles.filterBtnTextActive]}>
            전체 피드
          </Text>
        </TouchableOpacity>
      </View>

      {/* Community Feed List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#7A8F76" />
          <Text style={styles.loadingText}>광장의 생각들을 불러오는 중...</Text>
        </View>
      ) : displayedPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyTitle}>
            {filterMode === 'today'
              ? '오늘 질문에 도착한 생각이 아직 없어요'
              : '광장에 등록된 생각이 없습니다'}
          </Text>
          <Text style={styles.emptyDesc}>
            오늘 첫 번째로 내 생각을 익명으로 남겨보세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedPosts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#7A8F76"
              colors={['#7A8F76']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  questionBanner: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#F3EFE7',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7DD',
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A8F76',
    marginBottom: 4,
  },
  bannerQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E2B27',
    lineHeight: 20,
  },
  shareActionRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7DD',
  },
  shareActionBtn: {
    backgroundColor: '#EAE6DC',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  shareActionBtnDisabled: {
    backgroundColor: '#E4DFD5',
    opacity: 0.8,
  },
  shareActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F5E4E',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7DD',
  },
  filterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#EBE5D9',
  },
  filterBtnText: {
    fontSize: 12,
    color: '#8C867B',
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#383531',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#8C867B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#49453F',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8C867B',
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECE7DD',
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#49453F',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeAgoText: {
    fontSize: 11,
    color: '#A19C93',
  },
  reportBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#FAF5F3',
    borderRadius: 8,
  },
  reportBtnText: {
    fontSize: 10,
    color: '#B57C68',
    fontWeight: '600',
  },
  postQuestionRef: {
    fontSize: 12,
    color: '#7A8F76',
    fontWeight: '600',
    marginBottom: 6,
  },
  postText: {
    fontSize: 14,
    color: '#34312D',
    lineHeight: 22,
    marginBottom: 14,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F6F2E9',
    paddingTop: 10,
  },
  likeBtn: {
    backgroundColor: '#F7F5EE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2D7',
  },
  likeBtnActive: {
    backgroundColor: '#E2EBDD',
    borderColor: '#C6D8BE',
  },
  likeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#656057',
  },
  likeBtnTextActive: {
    color: '#3B6B35',
    fontWeight: '700',
  },
});
