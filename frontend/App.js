import 'expo-dev-client'; // Ensure this is at the top of your file
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { initDatabase } from './src/utils/database';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store/store';
import { registerForPushNotificationsAsync } from './src/utils/notificationHelper';
import { updatePushToken } from './src/actions/userActions';
import * as Notifications from 'expo-notifications';

// Import your navigators and screens
import DrawerNavigator from './src/navigation/DrawerNavigator';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AdminStackScreen from './src/navigation/AdminStack';
import LandingScreen from './src/screens/LandingScreen';

const Stack = createStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainApp" component={DrawerNavigator} />
      <Stack.Screen name="AdminApp" component={AdminStackScreen} />
    </Stack.Navigator>
  );
};

// Create a separate component for the app content that can use hooks
const AppContent = () => {
  const navigationRef = useRef(null);
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  // Initialize database
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    setupDatabase();
  }, []);

  // Register for push notifications and update token when user logs in
  useEffect(() => {
    if (user && token) {
      registerPushNotifications();
    }
  }, [user, token, dispatch]);

  // Function to register for push notifications
  const registerPushNotifications = async () => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await dispatch(updatePushToken(pushToken));
        console.log('Push token updated in database');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Set up notification response handler for navigation
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => subscription.remove();
  }, []);

  // Function to handle notification interactions
  // Function to handle notification interactions
   // Function to handle notification interactions
   const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
  
    if (data?.type === 'ORDER_STATUS_UPDATE' && data?.orderId) {
      // Navigate to order details screen
      if (navigationRef.current) {
        // For customer app
        if (navigationRef.current.isReady()) {
          navigationRef.current.navigate('MainApp', {
            screen: 'ProfileDrawer',
            params: {
              screen: 'OrderDetails',
              params: { orderId: data.orderId }
            }
          });
        }
      }
    } 
    // Handle promotion notifications - no params needed
    else if (data?.type === 'NEW_PROMOTION') {
      if (navigationRef.current && navigationRef.current.isReady()) {
        navigationRef.current.navigate('MainApp', {
          screen: 'ProfileDrawer',
          params: {
            screen: 'ActivePromotions'
          }
        });
      }
    }
  };
  
return (
  <NavigationContainer
    ref={navigationRef}
    linking={{
      prefixes: ['rledgewear://'], // You can use your own app scheme
      config: {
        screens: {
          MainApp: {
            screens: {
              ProfileDrawer: {
                screens: {
                  OrderDetails: 'order/:orderId',
                }
              }
            }
          },
          // Add navigation for admin too if needed
          AdminApp: {
            screens: {
              ManageOrders: 'admin/orders/:orderId'
            }
          }
        }
      }
    }}
  >
    <RootStack />
  </NavigationContainer>
);
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider>
            <AppContent />
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;