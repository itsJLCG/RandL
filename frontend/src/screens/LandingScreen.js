import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { checkStoredCredentials } from '../actions/authActions';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { 
  registerForPushNotificationsAsync, 
  scheduleBasicNotification,
  scheduleDelayedNotification 
} from '../utils/notificationHelper';

const LandingScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const dispatch = useDispatch();

  // Initialize notifications when component mounts
  useEffect(() => {
    // Set up notification permissions and get push token
    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setPushToken(token);
        
        // Listen for notifications received while app is foregrounded
        const notificationListener = Notifications.addNotificationReceivedListener(
          notification => {
            console.log('Notification received:', notification);
          }
        );
        
        // Listen for user tapping a notification
        const responseListener = Notifications.addNotificationResponseReceivedListener(
          response => {
            console.log('Notification response:', response);
            // You could navigate to specific screens based on notification data here
          }
        );
        
        // Clean up listeners when component unmounts
        return () => {
          Notifications.removeNotificationSubscription(notificationListener);
          Notifications.removeNotificationSubscription(responseListener);
        };
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
    
    setupNotifications();
  }, []);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);

      // Check for stored credentials
      const result = await dispatch(checkStoredCredentials());

      if (result.success) {
        // Navigate based on user role
        navigation.replace(result.isAdmin ? 'AdminApp' : 'MainApp');
      } else {
        // No valid stored credentials, go to login
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      navigation.navigate('Login');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send test notification
  const sendTestNotification = async () => {
    try {
      const notificationId = await scheduleBasicNotification(
        "Welcome to R&L Edge Wear", 
        "Thank you for using our app! Enjoy your shopping experience."
      );
      console.log('Notification scheduled with ID:', notificationId);
      Alert.alert(
        "Notification Sent", 
        "Check your notifications to see the welcome message!"
      );
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      Alert.alert("Error", "Failed to send notification");
    }
  };

  // Function to send delayed notification
  const sendDelayedNotification = async () => {
    try {
      const notificationId = await scheduleDelayedNotification(
        "Special Offer", 
        "Don't miss our latest collection! Check it out now.", 
        5
      );
      console.log('Delayed notification scheduled with ID:', notificationId);
      Alert.alert(
        "Notification Scheduled", 
        "You'll receive a special offer notification in 5 seconds!"
      );
    } catch (error) {
      console.error('Failed to schedule delayed notification:', error);
      Alert.alert("Error", "Failed to schedule notification");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/RandLLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.storeName}>R&L Edge Wear</Text>
        <Text style={styles.motto}>
          "Where Style Meets the Edge of Fashion"
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleGetStarted}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Get Started</Text>
          )}
        </TouchableOpacity>

        {/* Notification test buttons */}
        <TouchableOpacity
          style={[styles.notificationButton, styles.instantNotifButton]}
          onPress={sendTestNotification}
        >
          <Ionicons name="notifications" size={18} color="#FFFFFF" />
          <Text style={styles.notificationButtonText}>Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notificationButton, styles.delayedNotifButton]}
          onPress={sendDelayedNotification}
        >
          <Ionicons name="time" size={18} color="#FFFFFF" />
          <Text style={styles.notificationButtonText}>5-Second Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingVertical: height * 0.1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
  },
  storeName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38761d',
    textAlign: 'center',
    marginBottom: 10,
  },
  motto: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginHorizontal: 40,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#38761d',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  instantNotifButton: {
    backgroundColor: '#4a86e8',
  },
  delayedNotifButton: {
    backgroundColor: '#e69138',
  },
  notificationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LandingScreen;