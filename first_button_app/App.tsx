import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { GateScreen } from './src/components/GateScreen';
import { JournalScreen } from './src/screens/JournalScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TodayScreen } from './src/screens/TodayScreen';

type TabKey = 'today' | 'journal' | 'community' | 'settings';

function MainApp(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [showGate, setShowGate] = useState(true);
  const [journalRefreshKey, setJournalRefreshKey] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleJournalUpdated = () => {
    setJournalRefreshKey(prev => prev + 1);
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Main Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>잠깐</Text>
        <Text style={styles.headerSubtitle}>하루 한 번, 나를 위한 쉼표</Text>
      </View>

      {/* Screen Body */}
      <View style={styles.contentArea}>
        {activeTab === 'today' && (
          <TodayScreen onJournalUpdated={handleJournalUpdated} />
        )}
        {activeTab === 'journal' && (
          <JournalScreen
            refreshKey={journalRefreshKey}
            onJournalChanged={handleJournalUpdated}
          />
        )}
        {activeTab === 'community' && <CommunityScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      {!isKeyboardVisible && (
        <View
          style={[
            styles.navBar,
            {
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.navTab, activeTab === 'today' && styles.activeNavTab]}
            onPress={() => setActiveTab('today')}>
            <Text
              style={[
                styles.navTabText,
                activeTab === 'today' && styles.activeNavTabText,
              ]}>
              🌿 오늘
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.navTab,
              activeTab === 'journal' && styles.activeNavTab,
            ]}
            onPress={() => setActiveTab('journal')}>
            <Text
              style={[
                styles.navTabText,
                activeTab === 'journal' && styles.activeNavTabText,
              ]}>
              📖 기록
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.navTab,
              activeTab === 'community' && styles.activeNavTab,
            ]}
            onPress={() => setActiveTab('community')}>
            <Text
              style={[
                styles.navTabText,
                activeTab === 'community' && styles.activeNavTabText,
              ]}>
              🤝 광장
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.navTab,
              activeTab === 'settings' && styles.activeNavTab,
            ]}
            onPress={() => setActiveTab('settings')}>
            <Text
              style={[
                styles.navTabText,
                activeTab === 'settings' && styles.activeNavTabText,
              ]}>
              ⚙️ 설정
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Gate screen interceptor */}
      {showGate && <GateScreen onDismiss={() => setShowGate(false)} />}
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7DD',
    backgroundColor: '#FAF8F4',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F2C27',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8C867B',
    marginTop: 2,
  },
  contentArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECE7DD',
    paddingTop: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeNavTab: {
    backgroundColor: '#EBE5D9',
  },
  navTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C867B',
  },
  activeNavTabText: {
    color: '#344332',
    fontWeight: '700',
  },
});

export default App;
