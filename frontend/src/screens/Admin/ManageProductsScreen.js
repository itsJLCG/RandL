import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Text } from 'react-native-paper';
import { Table, Row, Rows } from 'react-native-table-component';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../actions/productActions';

const ManageProductsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products, error, isLoading } = useSelector(state => state.products);
  const [tableHead] = useState(['Name', 'Price', 'Category', 'Image', 'Actions']);
  const [widthArr] = useState([140, 80, 120, 80, 100]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dispatch(deleteProduct(productId));
              if (result.success) {
                Alert.alert('Success', 'Product deleted successfully');
              } else {
                Alert.alert('Error', result.message || 'Failed to delete product');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  const renderActionButtons = (item) => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditProduct(item)}
      >
        <Ionicons name="create-outline" size={20} color="#38761d" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteProduct(item._id)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderImage = (uri) => (
    <Image 
      source={{ uri }} 
      style={styles.productImage} 
      resizeMode="cover"
    />
  );

  const tableData = products.map(item => [
    item.name,
    `${item.price.toFixed(2)}`,
    item.category?.name || 'No category',
    renderImage(item.image?.url || 'https://via.placeholder.com/80'),
    renderActionButtons(item)
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#38761d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Products</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
        >
          <Ionicons name="add" size={24} color="#38761d" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#38761d" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <ScrollView horizontal={true}>
            <View>
              <Table borderStyle={styles.tableBorder}>
                <Row 
                  data={tableHead} 
                  widthArr={widthArr}
                  style={styles.tableHeader}
                  textStyle={styles.headerText}
                />
                <ScrollView style={styles.dataWrapper}>
                  <Table borderStyle={styles.tableBorder}>
                    <Rows 
                      data={tableData} 
                      widthArr={widthArr}
                      style={styles.row}
                      textStyle={styles.text}
                    />
                  </Table>
                </ScrollView>
              </Table>
            </View>
          </ScrollView>
        </View>
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
  addButton: {
    padding: 8,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    height: 50,
    backgroundColor: '#F9FAFB',
  },
  headerText: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1F2937',
    paddingLeft: 8,
  },
  text: {
    textAlign: 'left',
    fontSize: 14,
    color: '#4B5563',
    paddingLeft: 8,
  },
  row: {
    height: 80, // Increased height to accommodate image
    backgroundColor: '#FFFFFF',
  },
  dataWrapper: {
    marginTop: -1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginLeft: 8,
    marginVertical: 10,
  }
});

export default ManageProductsScreen;