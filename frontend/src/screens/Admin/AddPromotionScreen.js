import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { createPromotion } from '../../actions/promotionActions';
import { fetchProducts } from '../../actions/productActions';

const AddPromotionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products } = useSelector(state => state.products);
  const [isLoading, setIsLoading] = useState(false);
  const [promotion, setPromotion] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    isActive: true,
    products: []
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const validateForm = () => {
    let tempErrors = {};
    
    if (!promotion.title.trim()) 
      tempErrors.title = 'Title is required';
    
    if (!promotion.description.trim()) 
      tempErrors.description = 'Description is required';
    
    if (!promotion.discountPercentage) {
      tempErrors.discountPercentage = 'Discount percentage is required';
    } else {
      const discount = Number(promotion.discountPercentage);
      if (isNaN(discount) || discount <= 0 || discount > 100) {
        tempErrors.discountPercentage = 'Discount must be between 1-100%';
      }
    }

    if (selectedProducts.length === 0)
      tempErrors.products = 'Select at least one product';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Extract IDs from selected products
        const productIds = selectedProducts.map(product => product._id);
        
        const result = await dispatch(createPromotion({
          ...promotion,
          products: productIds,
          discountPercentage: Number(promotion.discountPercentage)
        }));

        if (result.success) {
          Alert.alert(
            'Success',
            'Promotion created successfully',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Error', result.message || 'Failed to create promotion');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to create promotion');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleProductSelection = (product) => {
    if (selectedProducts.find(p => p._id === product._id)) {
      setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.productItem,
        selectedProducts.find(p => p._id === item._id) && styles.selectedProductItem
      ]}
      onPress={() => toggleProductSelection(item)}
    >
      <Image 
        source={{ uri: item.image?.url || 'https://via.placeholder.com/50' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₱{item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.checkboxContainer}>
        {selectedProducts.find(p => p._id === item._id) && (
          <Ionicons name="checkmark-circle" size={24} color="#38761d" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#38761d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Promotion</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={promotion.title}
            onChangeText={(text) => setPromotion({ ...promotion, title: text })}
            placeholder="Enter promotion title"
            placeholderTextColor="#9CA3AF"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={promotion.description}
            onChangeText={(text) => setPromotion({ ...promotion, description: text })}
            placeholder="Enter promotion description"
            placeholderTextColor="#9CA3AF"
            multiline={true}
            numberOfLines={4}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Discount Percentage</Text>
          <TextInput
            style={[styles.input, errors.discountPercentage && styles.inputError]}
            value={promotion.discountPercentage}
            onChangeText={(text) => setPromotion({ ...promotion, discountPercentage: text })}
            placeholder="Enter discount percentage (1-100)"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          {errors.discountPercentage && (
            <Text style={styles.errorText}>{errors.discountPercentage}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active Status</Text>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "#BEE3F8" }}
              thumbColor={promotion.isActive ? "#38761d" : "#A1A1AA"}
              onValueChange={(value) => setPromotion({ ...promotion, isActive: value })}
              value={promotion.isActive}
            />
          </View>
          <Text style={styles.helperText}>
            {promotion.isActive ? 'Promotion is active and visible to customers' : 'Promotion is inactive'}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Products ({selectedProducts.length} selected)</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowProductSelector(true)}
          >
            <Text style={styles.selectButtonText}>Select Products</Text>
          </TouchableOpacity>
          {errors.products && (
            <Text style={styles.errorText}>{errors.products}</Text>
          )}

          {selectedProducts.length > 0 && (
            <View style={styles.selectedProductsContainer}>
              <Text style={styles.selectedProductsTitle}>Selected Products:</Text>
              {selectedProducts.map(product => (
                <View style={styles.selectedProductRow} key={product._id}>
                  <Text style={styles.selectedProductName}>{product.name}</Text>
                  <TouchableOpacity
                    onPress={() => toggleProductSelection(product)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Create Promotion</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Products</Text>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowProductSelector(false)}
            >
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item._id}
            style={styles.productList}
          />
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowProductSelector(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#38761d',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A7F3D0',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  selectButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#38761d',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedProductsContainer: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  selectedProductsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  selectedProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedProductName: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeModalButton: {
    padding: 4,
  },
  productList: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  selectedProductItem: {
    backgroundColor: '#F0FDF4',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkboxContainer: {
    width: 30,
    alignItems: 'center',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#38761d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPromotionScreen;