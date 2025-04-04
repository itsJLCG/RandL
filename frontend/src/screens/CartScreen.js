import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, removeFromCart, updateCartItemQuantity } from '../actions/cartActions';
import { Ionicons } from '@expo/vector-icons';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { items: cartItems, loading, error } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  
  // Add state for selected items
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  const loadCart = async () => {
    if (!user) {
      // Handle case where user is not logged in
      Alert.alert('Login Required', 'Please login to view your cart');
      navigation.navigate('Login');
      return;
    }
    
    setRefreshing(true);
    const result = await dispatch(fetchCart());
    setRefreshing(false);
    
    if (!result.success && result.error) {
      console.log('Error fetching cart:', result.error);
    } else {
      // Initialize all items as selected by default
      const initialSelection = {};
      result.items.forEach(item => {
        initialSelection[item._id] = true;
      });
      setSelectedItems(initialSelection);
      setSelectAll(true);
    }
  };
  
  // Fetch cart on component mount
  useEffect(() => {
    loadCart();
  }, [dispatch, user]);
  
  const handleRemoveItem = async (itemId) => {
    try {
      const result = await dispatch(removeFromCart(itemId));
      if (!result.success) {
        Alert.alert('Error', 'Failed to remove item from cart');
      }
      // Remove from selected items
      const updatedSelection = { ...selectedItems };
      delete updatedSelection[itemId];
      setSelectedItems(updatedSelection);
    } catch (err) {
      console.error('Remove cart item error:', err);
      Alert.alert('Error', 'An error occurred while removing item');
    }
  };

  // Toggle checkbox for a single item
  const toggleItemSelection = (itemId) => {
    const newSelectedItems = { 
      ...selectedItems,
      [itemId]: !selectedItems[itemId]
    };
    
    setSelectedItems(newSelectedItems);
    
    // Check if all items are selected
    const allSelected = cartItems.every(item => newSelectedItems[item._id]);
    setSelectAll(allSelected);
  };
  
  // Toggle all items
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    const newSelectedItems = {};
    
    cartItems.forEach(item => {
      newSelectedItems[item._id] = newSelectAll;
    });
    
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectAll);
  };
  
  // Handle quantity updates
  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const result = await dispatch(updateCartItemQuantity(item._id, newQuantity));
      if (!result.success) {
        Alert.alert('Error', 'Failed to update quantity');
      }
    } catch (err) {
      console.error('Update quantity error:', err);
      Alert.alert('Error', 'An error occurred while updating quantity');
    }
  };
  
  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems[item._id])
      .reduce((total, item) => total + (item.price * item.quantity), 0)
      .toFixed(2);
  };
  
  const getSelectedItemCount = () => {
    return cartItems.filter(item => selectedItems[item._id]).length;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#38761d" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadCart}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
            
      {cartItems && cartItems.length > 0 ? (
        <>
          {/* Select All Row */}
          <View style={styles.selectAllContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={toggleSelectAll}
            >
              <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
                {selectAll && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
            <Text style={styles.selectedCountText}>
              {getSelectedItemCount()} of {cartItems.length} selected
            </Text>
          </View>
          
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id?.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => toggleItemSelection(item._id)}
                >
                  <View style={[styles.checkbox, selectedItems[item._id] && styles.checkboxSelected]}>
                    {selectedItems[item._id] && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.itemImage}
                  defaultSource={require('../assets/placeholder.png')}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                  
                  {/* Quantity Controls */}
                  <View style={styles.quantityControlsRow}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Ionicons 
                        name="remove" 
                        size={16} 
                        color={item.quantity <= 1 ? "#D1D5DB" : "#38761d"} 
                      />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color="#38761d" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.removeButton} 
                      onPress={() => handleRemoveItem(item._id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={loadCart}
          />
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${calculateTotal()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>$5.00</Text>
            </View>
            <View style={[styles.totalRow, styles.finalRow]}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>${getSelectedItemCount() > 0 ? (parseFloat(calculateTotal()) + 5).toFixed(2) : '0.00'}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, getSelectedItemCount() === 0 && styles.disabledButton]}
              onPress={() => {
                if (getSelectedItemCount() > 0) {
                  // Pass only selected items to checkout
                  const selectedCartItems = cartItems.filter(item => selectedItems[item._id]);
                  navigation.navigate('Checkout', { selectedItems: selectedCartItems });
                } else {
                  Alert.alert('Selection Empty', 'Please select items to checkout');
                }
              }}
              disabled={getSelectedItemCount() === 0}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout ({getSelectedItemCount()} items)
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtext}>Add items to get started</Text>
          <TouchableOpacity 
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Keep existing styles and add new ones:
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    fontWeight: 'bold',
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  rightPlaceholder: {
    width: 40,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#38761d',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: '#38761d',
    borderColor: '#38761d',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  itemDetails: {
    marginLeft: 0,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38761d',
  },
  // New styles for quantity controls
  quantityControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 'auto',
  },
  removeButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 0,
  },
  totalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  finalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 16,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#38761d',
  },
  checkoutButton: {
    backgroundColor: '#38761d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  continueShoppingButton: {
    backgroundColor: '#38761d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CartScreen;