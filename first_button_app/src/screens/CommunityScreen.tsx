import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyQuestion, getTodayKey } from '../constants/questions';
import { loadJournalData } from '../services/storage';

interface CommunityPost {
  id: string;
  author: string;
  timeAgo: string;
  text: string;
  likes: number;
  isUserLiked?: boolean;
}

const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: '아침의 바람',
    timeAgo: '20분 전',
    text: '알람 끄고 인스타부터 켜려다 멈췄어요. 오늘은 날씨가 맑아서 창문 먼저 열었습니다.',
    likes: 12,
  },
  {
    id: 'post-2',
    author: '고요한 산책자',
    timeAgo: '1시간 전',
    text: '요즘 왜 이렇게 마음이 조급했는지 질문을 보고 깨달았네요. 일단 따뜻한 차 한 잔 마시려구요.',
    likes: 8,
  },
  {
    id: 'post-3',
    author: '새벽의 쉼표',
    timeAgo: '3시간 전',
    text: '남들의 속도에 맞추느라 나 자신을 돌보지 못했던 것 같아요. 오늘 하루는 내 속도대로 걸어볼 생각입니다.',
    likes: 19,
  },
  {
    id: 'post-4',
    author: '작은 나무',
    timeAgo: '5시간 전',
    text: '스스로에게 건네는 한마디 질문이 생각보다 큰 위로가 되네요 🌿',
    likes: 15,
  },
];

const COMMUNITY_STORAGE_KEY = 'jamkkan_community_posts';
const LIKES_STORAGE_KEY = 'jamkkan_community_likes';

export const CommunityScreen: React.FC = () => {
  const [question] = useState(getDailyQuestion());
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [hasSharedToday, setHasSharedToday] = useState(false);

  useEffect(() => {
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = async () => {
    try {
      const stored = await AsyncStorage.getItem(COMMUNITY_STORAGE_KEY);
      const likesRaw = await AsyncStorage.getItem(LIKES_STORAGE_KEY);
      const likedIds: string[] = likesRaw ? JSON.parse(likesRaw) : [];

      let postList: CommunityPost[] = stored ? JSON.parse(stored) : DEFAULT_POSTS;

      postList = postList.map(p => ({
        ...p,
        isUserLiked: likedIds.includes(p.id),
      }));

      setPosts(postList);

      // Check if user shared today
      const today = getTodayKey();
      const sharedCheck = await AsyncStorage.getItem(`shared_community_${today}`);
      setHasSharedToday(!!sharedCheck);
    } catch {
      setPosts(DEFAULT_POSTS);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const likesRaw = await AsyncStorage.getItem(LIKES_STORAGE_KEY);
      let likedIds: string[] = likesRaw ? JSON.parse(likesRaw) : [];

      const isLiked = likedIds.includes(postId);
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
              likes: isLiked ? p.likes - 1 : p.likes + 1,
              isUserLiked: !isLiked,
            };
          }
          return p;
        })
      );
    } catch (e) {
      console.warn('Like toggle failed', e);
    }
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
      Alert.alert('알림', '오늘의 생각은 이미 광장에 익명으로 공유되었습니다 ✦');
      return;
    }

    const newPost: CommunityPost = {
      id: `my-${Date.now()}`,
      author: '익명의 나그네',
      timeAgo: '방금 전',
      text: todayEntry.text.trim(),
      likes: 1,
      isUserLiked: false,
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    setHasSharedToday(true);

    await AsyncStorage.setItem(
      COMMUNITY_STORAGE_KEY,
      JSON.stringify(updated.slice(0, 20))
    );
    await AsyncStorage.setItem(`shared_community_${today}`, '1');

    Alert.alert(
      '익명 공유 완료',
      '오늘의 솔직한 생각이 광장에 익명으로 공유되었습니다. 다른 사람들에게 따뜻한 울림이 될 거예요 🌿'
    );
  };

  const renderItem = ({ item }: { item: CommunityPost }) => {
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.authorBadge}>
            <Text style={styles.authorIcon}>🌿</Text>
            <Text style={styles.authorName}>{item.author}</Text>
          </View>
          <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
        </View>

        <Text style={styles.postText}>{item.text}</Text>

        <View style={styles.postFooter}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.likeBtn,
              item.isUserLiked && styles.likeBtnActive,
            ]}
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
        <Text style={styles.bannerTag}>오늘 같은 질문을 마주한 사람들의 생각</Text>
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

      {/* Community Feed List */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  timeAgoText: {
    fontSize: 11,
    color: '#A19C93',
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
