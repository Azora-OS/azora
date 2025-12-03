import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for push notifications');
    }
    
    return finalStatus;
  }

  static async getExpoPushToken() {
    try {
      await this.requestPermissions();
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B4F6F',
        });
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'azora-student-mobile',
      });
      
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  static async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: { seconds: 1 },
    });
  }

  static async scheduleCourseReminder(courseTitle: string, scheduledTime: Date) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Course Starting Soon! 📚',
        body: `${courseTitle} begins in 15 minutes`,
        data: { type: 'course_reminder' },
        sound: 'default',
      },
      trigger: {
        date: new Date(scheduledTime.getTime() - 15 * 60 * 1000), // 15 minutes before
      },
    });
  }

  static async scheduleAZRReward(amount: number) {
    await this.scheduleLocalNotification(
      'AZR Earned! 💰',
      `You earned ${amount} AZR tokens for completing your lesson`,
      { type: 'azr_reward', amount }
    );
  }
}