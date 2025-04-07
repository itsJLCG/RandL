import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../actions/cartActions';
import { placeOrder } from '../actions/orderActions';

const CheckoutScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const selectedItems = route.params?.selectedItems;
  const cartItems = useSelector(state => selectedItems || state.cart.items);
  const { loading } = useSelector(state => state.orders);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentMethods] = useState([
    {
      id: 'credit_card',
      type: 'Credit Card',
      icon: 'card-outline',
    },
    {
      id: 'cod',
      type: 'Cash on Delivery',
      icon: 'cash-outline',
    }
  ]);

  // Add this function to handle payment method selection
const handlePaymentMethodSelect = (method) => {
  setSelectedPaymentMethod(method);
};

// Add useEffect to handle address from navigation params
useEffect(() => {
  if (route.params?.selectedAddress) {
    setSelectedAddress(route.params.selectedAddress);
  }
}, [route.params?.selectedAddress]);

  // Calculate order totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 45;
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please add a delivery address');
      return;
    }
  
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
  
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    
    setIsProcessing(true);
  
    // Modify the address mapping here to match the Order model's expected fields
    const shippingAddress = {
      name: selectedAddress.name,
      street: selectedAddress.address, // Change from address to street
      city: selectedAddress.city,
      state: selectedAddress.state,
      zip: selectedAddress.zip,
      country: selectedAddress.country,
      phone: selectedAddress.phone
    };
    
    const orderData = {
      orderItems: cartItems.map(item => ({
        product: item.id || item._id || item.product,
        name: item.title || item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress,  // Use the mapped address
      paymentMethod: selectedPaymentMethod.type,
      subtotal,
      shippingCost: shipping,
      tax,
      total
    };
    
    console.log('Sending order data:', JSON.stringify(orderData));
    
    try {
      const result = await dispatch(placeOrder(orderData));
      
      if (result.success) {
        dispatch(clearCart());
        Alert.alert('Success', 'Order placed successfully!', [
          {
            text: 'Go to Home',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeDrawer' }],
              });
            },
          },
        ]);
      } else {
        Alert.alert('Error', `Failed to place order: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.card}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Delivery Address</Text>
    <TouchableOpacity 
      style={styles.changeButton}
      onPress={() => navigation.navigate('Address', { selectedAddress })}
    >
      <Text style={styles.changeButtonText}>
        {selectedAddress ? 'Change' : 'Add'}
      </Text>
    </TouchableOpacity>
  </View>
  
  {selectedAddress ? (
    <View style={styles.addressContainer}>
      <Text style={styles.addressName}>{selectedAddress.name}</Text>
      <Text style={styles.addressLine}>{selectedAddress.street}</Text>
      <Text style={styles.addressLine}>
        {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
      </Text>
      <Text style={styles.addressLine}>{selectedAddress.country}</Text>
      <Text style={styles.addressLine}>{selectedAddress.phone}</Text>
    </View>
  ) : (
    <Text style={styles.noAddressText}>Please add a delivery address</Text>
  )}
</View>
        
        {/* Payment Method */}
        <View style={styles.card}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Payment Method</Text>
  </View>
  
  <View style={styles.paymentContainer}>
    {paymentMethods.map((method) => (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentOption,
          selectedPaymentMethod?.id === method.id && styles.selectedPaymentOption
        ]}
        onPress={() => handlePaymentMethodSelect(method)}
      >
        <Ionicons 
          name={method.icon} 
          size={24} 
          color={selectedPaymentMethod?.id === method.id ? '#FFFFFF' : '#38761d'} 
        />
        <Text style={[
          styles.paymentOptionText,
          selectedPaymentMethod?.id === method.id && styles.selectedPaymentOptionText
        ]}>
          {method.type}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
        
        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>
          
          {/* Items */}
          {cartItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          {/* Price Breakdown */}
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping</Text>
              <Text style={styles.priceValue}>₱{shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>₱{tax.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        {/* Estimated Delivery */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Estimated Delivery</Text>
          </View>
          <Text style={styles.deliveryDate}>
            {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', 
              { weekday: 'long', month: 'long', day: 'numeric' }
            )}
          </Text>
        </View>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.placeOrderButton, (isProcessing || loading) && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={isProcessing || loading || cartItems.length === 0}
        >
          {isProcessing || loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order • ₱{total.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
    padding: 4,
  },
  placeholderButton: {
    width: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  changeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeButtonText: {
    color: '#38761d',
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  addressLine: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 3,
  },
  paymentContainer: {
    marginBottom: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 10,
  },
  paymentText: {
    fontSize: 15,
    color: '#1F2937',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 70,
    height: 70,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    resizeMode: 'contain',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 6,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38761d',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  priceBreakdown: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38761d',
  },
  deliveryDate: {
    fontSize: 15,
    color: '#1F2937',
  },
  bottomSpace: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  placeOrderButton: {
    backgroundColor: '#38761d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Add these to your existing styles
paymentContainer: {
  marginTop: 8,
},
paymentOption: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  marginBottom: 8,
},
selectedPaymentOption: {
  backgroundColor: '#38761d',
  borderColor: '#38761d',
},
paymentOptionText: {
  marginLeft: 12,
  fontSize: 16,
  color: '#1F2937',
},
selectedPaymentOptionText: {
  color: '#FFFFFF',
},
noAddressText: {
  color: '#6B7280',
  fontSize: 14,
  fontStyle: 'italic',
},
});

export default CheckoutScreen;