import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { JamkkanBridge } = NativeModules;

export interface AlarmSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: '잠깐 성찰 알림 권한',
          message:
            '설정한 시간에 오늘의 성찰 질문을 잠금화면과 상단바에 표시하기 위해 알림 권한이 필요합니다.',
          buttonPositive: '허용',
          buttonNegative: '나중에',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  } catch (err) {
    console.warn(err);
    return false;
  }
}

export async function syncWidgetData(question: string, dateText: string): Promise<boolean> {
  if (Platform.OS === 'android' && JamkkanBridge?.updateWidgetData) {
    try {
      return await JamkkanBridge.updateWidgetData(question, dateText);
    } catch (e) {
      console.warn('Widget update failed', e);
    }
  }
  return false;
}

export async function scheduleDailyAlarm(
  hour: number,
  minute: number,
  question: string
): Promise<boolean> {
  if (Platform.OS === 'android' && JamkkanBridge?.setDailyAlarm) {
    try {
      return await JamkkanBridge.setDailyAlarm(hour, minute, question);
    } catch (e) {
      console.warn('Alarm schedule failed', e);
    }
  }
  return false;
}

export async function cancelDailyAlarm(): Promise<boolean> {
  if (Platform.OS === 'android' && JamkkanBridge?.cancelDailyAlarm) {
    try {
      return await JamkkanBridge.cancelDailyAlarm();
    } catch (e) {
      console.warn('Alarm cancellation failed', e);
    }
  }
  return false;
}

export async function getAlarmSettings(): Promise<AlarmSettings> {
  if (Platform.OS === 'android' && JamkkanBridge?.getAlarmSettings) {
    try {
      return await JamkkanBridge.getAlarmSettings();
    } catch (e) {
      console.warn('Get alarm settings failed', e);
    }
  }
  return { enabled: false, hour: 7, minute: 0 };
}
