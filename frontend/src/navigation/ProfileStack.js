import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import CreateReviewScreen from '../screens/CreateReviewScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import EditReviewScreen from '../screens/EditReviewScreen';
import ActivePromotionsScreen from '../screens/ActivePromotionsScreen';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#38761d',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{ paddingLeft: 15 }}
            >
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="ReviewScreen" component={ReviewsScreen} />
      <Stack.Screen name="ActivePromotions" component={ActivePromotionsScreen} />
      <Stack.Screen
        name="CreateReview"
        component={CreateReviewScreen}
        options={{
          title: 'Write a Review',
          headerShown: true
        }}
      />
      <Stack.Screen
        name="EditReview"
        component={EditReviewScreen}
        options={{
          title: 'Edit Review',
          headerShown: true
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;