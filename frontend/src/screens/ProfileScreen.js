import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { LOGOUT } from '../constants/actionTypes';
import { fetchUserProfile } from '../actions/authActions';

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading, error, token } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  // Add focus listener to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (token) {
        dispatch(fetchUserProfile());
      }
    });

    return unsubscribe;
  }, [navigation, dispatch, token]);

  // Watch for refresh parameter from EditProfileScreen
  useEffect(() => {
    const refresh = route?.params?.refresh;
    const timestamp = route?.params?.timestamp;

    if (refresh && token) {
      dispatch(fetchUserProfile());
      // Clear the parameters
      navigation.setParams({
        refresh: undefined,
        timestamp: undefined
      });
    }
  }, [route?.params?.refresh, route?.params?.timestamp, dispatch, token, navigation]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchUserProfile());
    } catch (err) {
      console.error('Profile refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          await dispatch(fetchUserProfile());
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      }
    };
    fetchProfile();
  }, [dispatch, token]);

  // Add error boundary for API responses
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        'Failed to load profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [error]);
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#38761d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=38761d&color=fff&size=200`;


  const menuItems = [
    {
      icon: 'cart-outline',
      title: 'My Orders',
      badge: user?.orders?.length || 0,
      subtitle: 'Track and manage your orders',
      onPress: () => navigation.navigate('MyOrders')
    },
    {
      icon: 'star-outline',
      title: 'My Reviews',
      badge: user?.reviews?.length || 0,
      subtitle: 'See your product reviews',
      onPress: () => navigation.navigate('ReviewScreen')
    },
    {
      icon: 'location-outline',
      title: 'Delivery Address',
      subtitle: user?.address || 'Add your delivery address',
      onPress: () => navigation.navigate('EditProfile', { user })
    },
    {
      icon: 'settings-outline',
      title: 'Account Settings',
      subtitle: 'Update your profile information',
      onPress: () => navigation.navigate('EditProfile', { user })
    },
    {
      icon: 'help-circle-outline',
      title: 'Promotions & Offers',
      subtitle: 'Check out the latest promotions',
      onPress: () => navigation.navigate('ActivePromotions', { user })
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: LOGOUT });
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { user });
  };

  const handleMenuPress = (item) => {
    if (item.onPress) {
      item.onPress();
    }
  };
  console.log('User Image Data:', user?.image);
  const ProfileHeader = () => {
    const [localImageError, setLocalImageError] = useState(false);

    const imageSource = React.useMemo(() => {
      if (localImageError || !user?.image?.url) {
        return { uri: defaultImage };
      }
      return { uri: user.image.url };
    }, [user?.image?.url, localImageError]);

    console.log('Profile Image Source:', imageSource);

    return (
      <View style={styles.profileCard}>
        <Image
          source={imageSource}
          style={styles.profileImage}
          onError={() => {
            console.log('Image load error:', user?.image?.url);
            setLocalImageError(true);
          }}
          resizeMode="cover"
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
          {user?.address && (
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.addressText} numberOfLines={2}>
                {user.address}
              </Text>
            </View>
          )}
          <View style={styles.profileMetaContainer}>
            {user?.role && (
              <View style={styles.roleContainer}>
                <Ionicons
                  name={user.role === 'admin' ? 'shield-checkmark' : 'person'}
                  size={14}
                  color="#38761d"
                />
                <Text style={styles.roleText}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
              </View>
            )}
            {user?.createdAt && (
              <Text style={styles.memberSince}>
                Member since {new Date(user.createdAt).getFullYear()}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={20} color="#38761d" />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#F9FAFB"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#38761d']}
            tintColor="#38761d"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <ProfileHeader />

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={22} color="#38761d" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <View style={styles.menuRight}>
                {item.badge > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  profileMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: '#38761d',
    marginLeft: 4,
    fontWeight: '600',
  },
  memberSince: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 12,
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#38761d',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 16,
  },
});

export default ProfileScreen;