import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://swfqgxfvbgqkywdmhpfm.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZnFneGZ2Ymdxa3l3ZG1ocGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMzcxNTQsImV4cCI6MjEwODYxMzE1NH0.AABIILrO0bR2CSh8Ev2niq8P86fwOQ7BhAQSNloMPsc';

const CACHE_KEY = 'jamkkan_supabase_posts_cache';

export interface RemoteCommunityPost {
  id: string;
  created_at: string;
  author: string;
  text: string;
  question: string;
  likes: number;
}

export interface PostWithMeta extends RemoteCommunityPost {
  timeAgo: string;
  isUserLiked?: boolean;
}

const COMMON_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

// Relative time calculator
export function formatTimeAgo(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return '방금 전';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;
    return '일주일 전';
  } catch {
    return '최근';
  }
}

// Fetch posts from Supabase (with fallback to local cache)
export async function fetchLiveCommunityPosts(): Promise<PostWithMeta[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/community_posts?select=*&order=created_at.desc&limit=50`,
      {
        method: 'GET',
        headers: COMMON_HEADERS,
      }
    );

    if (!res.ok) {
      throw new Error(`Supabase fetch status: ${res.status}`);
    }

    const data: RemoteCommunityPost[] = await res.json();

    // Cache locally
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));

    return data.map(p => ({
      ...p,
      timeAgo: formatTimeAgo(p.created_at),
    }));
  } catch (error) {
    console.warn('Live fetch failed, loading cache:', error);
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: RemoteCommunityPost[] = JSON.parse(cached);
      return data.map(p => ({
        ...p,
        timeAgo: formatTimeAgo(p.created_at),
      }));
    }
    return [];
  }
}

// Publish post to Supabase
export async function publishLivePost(
  text: string,
  question: string,
  author: string = '익명의 나그네'
): Promise<PostWithMeta | null> {
  try {
    const body = JSON.stringify({
      author,
      text,
      question,
      likes: 1,
    });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts`, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body,
    });

    if (!res.ok) {
      throw new Error(`Publish failed: ${res.status}`);
    }

    const insertedList: RemoteCommunityPost[] = await res.json();
    if (insertedList && insertedList.length > 0) {
      const inserted = insertedList[0];
      return {
        ...inserted,
        timeAgo: '방금 전',
        isUserLiked: true,
      };
    }
    return null;
  } catch (error) {
    console.warn('Publish post error:', error);
    return null;
  }
}

// Update like count in Supabase
export async function updateLivePostLikes(
  postId: string,
  newLikes: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/community_posts?id=eq.${postId}`,
      {
        method: 'PATCH',
        headers: COMMON_HEADERS,
        body: JSON.stringify({ likes: newLikes }),
      }
    );
    return res.ok;
  } catch (error) {
    console.warn('Like update error:', error);
    return false;
  }
}
