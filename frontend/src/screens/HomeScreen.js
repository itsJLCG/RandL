import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../actions/productActions';
import { fetchCategories } from '../actions/categoryActions';
import { addToCart } from '../actions/cartActions';
import ProductCard from '../components/ProductCard';
import SearchFilter from '../components/SearchFilter';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const filterProducts = useCallback(() => {
    let filtered = [...products];
  
    // Apply search query filter (for product names, category names, and prices)
    if (searchQuery) {
      filtered = filtered.filter(product => {
        const matchName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = product.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const searchPrice = parseFloat(searchQuery);
        // Modified to match exact price instead of range
        const matchPrice = !isNaN(searchPrice) && product.price === searchPrice;
  
        return matchName || matchCategory || matchPrice;
      });
    }
  
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category?._id === selectedCategory
      );
    }
  
    // Apply price range filter (only for slider filter, not search)
    if (priceRange && !searchQuery) {
      filtered = filtered.filter(product =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
    }
  
    console.log('Filtered Products:', filtered);
    console.log('Current Filters:', { searchQuery, selectedCategory, priceRange });
  
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, priceRange]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Discover Products</Text>
          <Text style={styles.headerSubtitle}>Browse our latest collection</Text>
        </View>
      </View>

      <SearchFilter
        onSearch={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
      />

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={handleAddToCart} />
        )}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  menuButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  }
});

export default HomeScreen;