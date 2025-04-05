import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { Platform } from 'react-native';
import { API_URL_EMULATOR, API_URL_DEVICE } from '@env';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { auth } from '../config/firebase'; 
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { storeAuthToken } from '../utils/database';
import { LOGIN_SUCCESS } from '../constants/actionTypes';
import { configureGoogleSignIn } from '../config/firebase';

// Configure API URL based on platform and environment
const API_URL = __DEV__
  ? Platform.select({
      android: Platform.isEmulator ? API_URL_EMULATOR : API_URL_DEVICE,
      default: API_URL_DEVICE
    })
  : API_URL_DEVICE;

const GoogleSignInButton = ({ onSignInComplete }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const initGoogleSignIn = async () => {
      try {
        // Use the configuration function from firebase config
        configureGoogleSignIn();
        
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        
        try {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
          }
        } catch (signInCheckError) {
          console.log('Sign in check error (non-fatal):', signInCheckError);
        }
      } catch (error) {
        console.error('Google Sign-In init error:', error);
      }
    };
    
    initGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log('Sign out error (continuing):', signOutError);
      }
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign-In response:", userInfo);
      
      const idToken = userInfo.idToken || userInfo.data?.idToken;
      
      if (!idToken) {
        throw new Error('No ID token present in Google Sign-In response');
      }
      
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
      
      const firebaseToken = await user.getIdToken();
      
      // Send token to backend with required fields for user creation
      const response = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: firebaseToken,
          name: user.displayName,
          email: user.email,
          // Add a placeholder address to satisfy validation
          address: "Google user - Please update your address",
          // We'll create a random password on the backend
          password: `google-${Math.random().toString(36).slice(2,10)}`,
          image: {
            url: user.photoURL,
            public_id: `google-${user.uid}`
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await storeAuthToken(data.user._id, data.user.token);
        
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            user: data.user,
            token: data.user.token
          }
        });
        
        if (onSignInComplete) {
          onSignInComplete({
            success: true,
            isAdmin: data.user.role === 'admin'
          });
        }
      } else {
        throw new Error(data.error || 'Failed to authenticate with backend');
      }
    } catch (error) {
      let errorMessage = 'Authentication failed';
      console.error('Google Login Error details:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Play services not available';
      } else {
        errorMessage = error.message || 'Unknown authentication error';
      }
      
      alert(`Authentication failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.googleButton}
      disabled={loading}
      onPress={handleGoogleSignIn}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default GoogleSignInButton;