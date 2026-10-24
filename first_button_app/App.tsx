import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GateScreen } from './src/components/GateScreen';
import { JournalScreen } from './src/screens/JournalScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TodayScreen } from './src/screens/TodayScreen';

type TabKey = 'today' | 'journal' | 'settings';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [showGate, setShowGate] = useState(true);
  const [journalRefreshKey, setJournalRefreshKey] = useState(0);

  const handleJournalUpdated = () => {
    setJournalRefreshKey(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
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

      {/* Gate screen interceptor */}
      {showGate && <GateScreen onDismiss={() => setShowGate(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7DD',
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    shadowColor: '#2D2A26',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 4,
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
