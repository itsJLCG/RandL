import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../../actions/orderActions';
import { Picker } from '@react-native-picker/picker';

const OrderCard = ({ order, onStatusChange }) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const statusColors = {
    Processing: '#FCD34D',
    Shipped: '#60A5FA',
    Delivered: '#34D399',
    Cancelled: '#EF4444'  // Add color for Cancelled status
  };
  const canChangeStatus = (currentStatus) => {
    return currentStatus !== 'Cancelled' && currentStatus !== 'Delivered';
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.customerName}>
          Customer: {order.user?.name || 'N/A'}
        </Text>
        <Text style={styles.orderTotal}>
          Total: ₱{order.total?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={[
          styles.pickerContainer,
          { backgroundColor: statusColors[order.status] }
        ]}>
          <Picker
            selectedValue={order.status}
            style={[styles.statusPicker, { color: '#FFFFFF' }]}
            dropdownIconColor="#FFFFFF"
            onValueChange={(value) => onStatusChange(order._id, value)}
          >
            <Picker.Item label="Processing" value="Processing" />
            <Picker.Item label="Shipped" value="Shipped" />
            <Picker.Item label="Delivered" value="Delivered" />
            <Picker.Item label="Cancelled" value="Cancelled" />
          </Picker>
        </View>
      </View>

      {isPickerVisible && (
        <Picker
          selectedValue={order.status}
          style={styles.picker}
          onValueChange={(value) => {
            onStatusChange(order._id, value);
            setPickerVisible(false);
          }}
        >
          <Picker.Item label="Processing" value="Processing" />
          <Picker.Item label="Shipped" value="Shipped" />
          <Picker.Item label="Delivered" value="Delivered" />
        </Picker>
      )}

      <View style={styles.orderItems}>
        <Text style={styles.itemsLabel}>Items:</Text>
        {order.orderItems.map((item, index) => (
          <Text key={index} style={styles.itemText}>
            • {item.name} (x{item.quantity})
          </Text>
        ))}
      </View>

      <View style={styles.shippingInfo}>
        <Text style={styles.shippingLabel}>Shipping Address:</Text>
        <Text style={styles.addressText}>
          {order.shippingAddress.name}{'\n'}
          {order.shippingAddress.street}{'\n'}
          {order.shippingAddress.city}, {order.shippingAddress.state}{'\n'}
          {order.shippingAddress.zip}
        </Text>
      </View>
    </View>
  );
};

const ManageOrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await dispatch(updateOrderStatus(orderId, newStatus));
      if (result.success) {
        Alert.alert(
          'Status Updated',
          `Order status has been updated to ${newStatus}. A notification has been sent to the customer.`
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update order status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#38761d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#38761d" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onStatusChange={handleStatusChange}
            />
          )}
          contentContainerStyle={styles.ordersList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  pickerContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    flex: 1,
    maxWidth: 165,
  },
  statusPicker: {
    height: 60,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: '#4B5563',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  picker: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  shippingInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  shippingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
});

export default ManageOrdersScreen;