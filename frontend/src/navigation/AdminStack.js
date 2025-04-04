import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import admin screens
import AdminScreen from '../screens/Admin/AdminScreen';
import ManageProductsScreen from '../screens/Admin/ManageProductsScreen';
import AddProductScreen from '../screens/Admin/AddProductScreen';
import EditProductScreen from '../screens/Admin/EditProductScreen';
import ManageCategoriesScreen from '../screens/Admin/ManageCategoriesScreen';
import AddCategoryScreen from '../screens/Admin/AddCategoryScreen';
import EditCategoryScreen from '../screens/Admin/EditCategoryScreen';
import ManageUsersScreen from '../screens/Admin/ManageUserScreen';
import ManageOrdersScreen from '../screens/Admin/ManageOrdersScreen';

const AdminStack = createStackNavigator();

const AdminStackScreen = () => {
  return (
    <AdminStack.Navigator
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
        headerShown: false,
      }}
    >
      <AdminStack.Screen 
        name="AdminDashboard" 
        component={AdminScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <AdminStack.Screen 
        name="ManageProducts" 
        component={ManageProductsScreen}
        options={{ title: 'Manage Products' }}
      />
      <AdminStack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
      />
      <AdminStack.Screen 
        name="ManageCategories" 
        component={ManageCategoriesScreen}
        options={{ title: 'Manage Categories' }}
      />
      <AdminStack.Screen 
        name="AddCategory" 
        component={AddCategoryScreen}
        options={{ title: 'Add Category' }}
      />
      <AdminStack.Screen 
        name="EditCategory" 
        component={EditCategoryScreen}
        options={{ title: 'Edit Category' }}
      />
      <AdminStack.Screen 
        name="EditProduct" 
        component={EditProductScreen}
        options={{ title: 'Edit Product' }}
      />
      <AdminStack.Screen 
        name="ManageUsers" 
        component={ManageUsersScreen}
        options={{ title: 'Manage Users' }}
      />
      <AdminStack.Screen 
        name="ManageOrders" 
        component={ManageOrdersScreen}
        options={{ title: 'Manage Orders' }}
      />
    </AdminStack.Navigator>
  );
};

export default AdminStackScreen;