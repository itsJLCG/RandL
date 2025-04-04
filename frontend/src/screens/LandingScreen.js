import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { checkStoredCredentials } from '../actions/authActions';
import { Ionicons } from '@expo/vector-icons';

const LandingScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

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

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/RandLLogo.png')} // Make sure to add your logo file
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.storeName}>R&L Edge Wear</Text>
        <Text style={styles.motto}>
          "Where Style Meets the Edge of Fashion"
        </Text>
      </View>

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
  button: {
    backgroundColor: '#38761d',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 40,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LandingScreen;