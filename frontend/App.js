import 'expo-dev-client'; // Ensure this is at the top of your file
import 'react-native-reanimated'; 
import 'react-native-gesture-handler';
import React from 'react';
import { useEffect } from 'react';
import { initDatabase } from './src/utils/database';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store/store';

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

const App = () => {

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider>
            <NavigationContainer>
              <RootStack />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;