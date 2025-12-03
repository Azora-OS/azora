import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/notifications';

export function useNotifications() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Initialize push notifications
    NotificationService.getExpoPushToken().then(token => {
      if (token) {
        console.log('Push token:', token);
        // TODO: Send token to backend for user registration
      }
    });

    // Listen for notifications received while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user tapping on notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'course_reminder') {
        // Navigate to courses screen
        console.log('Navigate to course');
      } else if (data?.type === 'azr_reward') {
        // Navigate to wallet screen
        console.log('Navigate to wallet');
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    scheduleLocalNotification: NotificationService.scheduleLocalNotification,
    scheduleCourseReminder: NotificationService.scheduleCourseReminder,
    scheduleAZRReward: NotificationService.scheduleAZRReward,
  };
}