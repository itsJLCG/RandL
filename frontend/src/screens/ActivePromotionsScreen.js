import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivePromotions } from '../actions/promotionActions';

const ActivePromotionsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { activePromotions, isLoading } = useSelector(state => state.promotions);
  
  useEffect(() => {
    loadActivePromotions();
  }, []);

  const loadActivePromotions = () => {
    dispatch(fetchActivePromotions());
  };

  const renderPromoItem = ({ item }) => (
    <View style={styles.promotionCard}>
      <View style={styles.promotionHeader}>
        <Text style={styles.promotionTitle}>{item.title}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discountPercentage}% OFF</Text>
        </View>
      </View>
      <Text style={styles.promotionDescription}>{item.description}</Text>
      
      {item.products && item.products.length > 0 && (
        <View style={styles.productsContainer}>
          <Text style={styles.productsTitle}>Applies to:</Text>
          <FlatList
            data={item.products.slice(0, 3)}
            horizontal
            renderItem={({ item: product }) => (
              <TouchableOpacity
                style={styles.productItem}
                onPress={() => navigation.navigate('ProductDetails', { productId: product._id })}
              >
                <Image 
                  source={{ uri: product.image?.url || 'https://via.placeholder.com/100' }}
                  style={styles.productImage}
                />
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={product => product._id}
          />
          {item.products.length > 3 && (
            <Text style={styles.moreProducts}>+{item.products.length - 3} more</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {isLoading ? (
        <ActivityIndicator size="large" color="#38761d" style={styles.loader} />
      ) : (
        <FlatList
          data={activePromotions}
          renderItem={renderPromoItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No active promotions available</Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={loadActivePromotions}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  backButton: {
    padding: 8
  },
  placeholder: {
    width: 40
  },
  listContainer: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  promotionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16
  },
  discountText: {
    color: '#38761d',
    fontWeight: '700',
    fontSize: 14
  },
  promotionDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16
  },
  productsContainer: {
    marginTop: 8
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8
  },
  productItem: {
    width: 80,
    marginRight: 12
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginBottom: 4
  },
  productName: {
    fontSize: 12,
    color: '#4B5563'
  },
  moreProducts: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16
  }
});

export default ActivePromotionsScreen;