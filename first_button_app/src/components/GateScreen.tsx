import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GATE_MESSAGES } from '../constants/questions';

interface Props {
  onDismiss: () => void;
}

export const GateScreen: React.FC<Props> = ({ onDismiss }) => {
  const insets = useSafeAreaInsets();
  const [msg] = useState(
    () => GATE_MESSAGES[Math.floor(Math.random() * GATE_MESSAGES.length)]
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Pulse animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 3 second timer progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        closeGate();
      }
    });
  }, []);

  const closeGate = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const handlePress = () => {
    // Allow tap to skip only after 1 second of pause
    if (Date.now() - startTimeRef.current > 1000) {
      closeGate();
    }
  };

  const ringWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={styles.touchArea}>
        <Animated.View
          style={[styles.contentCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Text style={styles.circleEmoji}>🌿</Text>
              </View>
            </View>
          </View>

          <Text style={styles.titleText}>잠깐</Text>
          <Text style={styles.msgText}>{msg}</Text>

          {/* Progress Bar Container */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: ringWidth }]} />
          </View>

          <Text style={styles.subText}>3초간 잠시 숨을 고릅니다</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FAF8F4',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  contentCard: {
    width: width - 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE7DD',
    shadowColor: '#2C2B29',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 20,
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3EFE6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E7E2D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleEmoji: {
    fontSize: 26,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#383633',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  msgText: {
    fontSize: 16,
    color: '#6E6A63',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 28,
  },
  progressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: '#ECE7DE',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7A8F76',
    borderRadius: 2,
  },
  subText: {
    fontSize: 12,
    color: '#A19C93',
  },
});
