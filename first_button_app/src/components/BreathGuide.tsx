import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PHASES = [
  { label: '들이쉬기', duration: 4000, scale: 1.35 },
  { label: '유지하기', duration: 4000, scale: 1.35 },
  { label: '내쉬기', duration: 4000, scale: 0.95 },
  { label: '쉬기', duration: 2000, scale: 1.0 },
];

export const BreathGuide: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isActive) {
      runPhase(0);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      setPhaseIndex(0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive]);

  const runPhase = (idx: number) => {
    const current = PHASES[idx % PHASES.length];
    setPhaseIndex(idx % PHASES.length);

    Animated.timing(scaleAnim, {
      toValue: current.scale,
      duration: current.duration,
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(() => {
      runPhase(idx + 1);
    }, current.duration);
  };

  const toggleBreath = () => {
    setIsActive(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleBreath}
        style={styles.touchArea}>
        <Animated.View
          style={[styles.outerOrb, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.innerOrb}>
            <Text style={styles.labelText}>
              {isActive ? PHASES[phaseIndex].label : '잠깐'}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.caption}>
        {isActive ? '터치하면 멈춥니다' : '원을 터치해 1분간 숨을 고릅니다'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 18,
  },
  touchArea: {
    padding: 10,
  },
  outerOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EBE5D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F9F7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#656057',
  },
  caption: {
    marginTop: 8,
    fontSize: 12,
    color: '#A19C93',
  },
});
