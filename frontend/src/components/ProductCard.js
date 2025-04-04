import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProductCard = ({ product, onAddToCart }) => {
  const navigation = useNavigation();
  
  const handleProductPress = () => {
    navigation.navigate('SingleProduct', { productId: product._id });
  };

  // Get image source based on the product image structure
  const getImageSource = () => {
    if (!product) return null;
    
    // Handle case when image is an object with url property (from Cloudinary)
    if (product.image && product.image.url) {
      return { uri: product.image.url };
    }
    
    // Handle case when image is a direct string URL
    if (typeof product.image === 'string') {
      return { uri: product.image };
    }
    
    // Fallback to a placeholder image
    return require('../assets/placeholder.png'); // Make sure this file exists
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handleProductPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={getImageSource()} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.detailsContainer}>
        <Text numberOfLines={2} style={styles.title}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₱{parseFloat(product.price).toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  detailsContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    height: 40,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38761d',
  },
  addButton: {
    backgroundColor: '#38761d',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCard;