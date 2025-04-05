import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Set notification handler for how notifications should be handled when app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Schedule a basic notification
export async function scheduleBasicNotification(title = "Hello!", body = "This is a test notification") {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: 'Custom data here' },
    },
    trigger: null, // Show immediately
  });
}

// Schedule a notification with delay
export async function scheduleDelayedNotification(
  title = "Reminder!", 
  body = "This is your scheduled notification", 
  seconds = 5
) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: 'Custom data for delayed notification' },
    },
    trigger: {
      seconds,
    },
  });
}

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = 
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push token:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Hook to set up notification listeners
export function useNotifications(onNotificationReceived, onNotificationResponse) {
  useEffect(() => {
    // Register for notifications
    registerForPushNotificationsAsync();
    
    // When a notification is received while the app is in the foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // When the user taps on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [onNotificationReceived, onNotificationResponse]);
}

