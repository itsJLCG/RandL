import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { 
  registerForPushNotificationsAsync, 
  scheduleBasicNotification, 
  scheduleDelayedNotification 
} from '../utils/notificationHelper';

export default function NotificationExample() {
  const [notification, setNotification] = useState(null);
  const [pushToken, setPushToken] = useState('');

  useEffect(() => {
    // Get push token when component mounts
    registerForPushNotificationsAsync().then(token => {
      if (token) setPushToken(token);
    });

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        setNotification(notification);
      }
    );

    // Listen for user interaction with notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification tapped:', response);
      }
    );

    // Clean up
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const sendImmediateNotification = async () => {
    const id = await scheduleBasicNotification('Hello!', 'This is an immediate notification');
    console.log('Scheduled notification with ID:', id);
  };

  const sendDelayedNotification = async () => {
    const id = await scheduleDelayedNotification('Delayed Notification', 'This appears after 5 seconds', 5);
    console.log('Scheduled delayed notification with ID:', id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Example</Text>
      
      {pushToken ? (
        <Text style={styles.tokenText}>Push Token: {pushToken.substring(0, 20)}...</Text>
      ) : (
        <Text style={styles.warning}>Push token not available</Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Send Immediate Notification"
          onPress={sendImmediateNotification}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Send Notification in 5 seconds"
          onPress={sendDelayedNotification}
        />
      </View>

      {notification && (
        <View style={styles.notificationDisplay}>
          <Text style={styles.subtitle}>Last Notification:</Text>
          <Text>Title: {notification.request.content.title}</Text>
          <Text>Body: {notification.request.content.body}</Text>
          <Text>Data: {JSON.stringify(notification.request.content.data)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tokenText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 20,
  },
  warning: {
    color: 'orange',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
  },
  notificationDisplay: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
});