import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const SearchFilter = ({ 
    onSearch, 
    categories, 
    selectedCategory,
    onCategoryChange,
    priceRange,
    onPriceRangeChange 
  }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [localPriceRange, setLocalPriceRange] = useState(priceRange);

    const handleSearch = (text) => {
        setSearchText(text);
        
        // Check if the search text is a number (price search)
        const searchPrice = parseFloat(text);
        if (!isNaN(searchPrice)) {
          onPriceRangeChange([searchPrice, searchPrice + 1000]);
        }
    
        // Check if the search matches any category names
        const matchedCategory = categories?.find(category => 
          category.name.toLowerCase().includes(text.toLowerCase())
        );
        if (matchedCategory) {
          onCategoryChange(matchedCategory._id);
        }
    
        // Pass the search text for product name filtering
        onSearch(text);
      };
    
      const handlePriceRangeChange = (value) => {
        setLocalPriceRange(value);
      };
    
      const handleApplyFilters = () => {
        onPriceRangeChange(localPriceRange);
        setShowFilters(false);
      };
    
      // Reset category when search is cleared
      useEffect(() => {
        if (!searchText) {
          onCategoryChange(null);
          onPriceRangeChange([0, 10000]);
        }
      }, [searchText]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={20} color="#38761d" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.filterTitle}>Categories</Text>
              <View style={styles.categoriesContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !selectedCategory && styles.selectedCategoryChip
                  ]}
                  onPress={() => onCategoryChange(null)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    !selectedCategory && styles.selectedCategoryChipText
                  ]}>All</Text>
                </TouchableOpacity>
                {categories?.map((category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category._id && styles.selectedCategoryChip
                    ]}
                    onPress={() => onCategoryChange(category._id)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category._id && styles.selectedCategoryChipText
                    ]}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceText}>
                  ₱{localPriceRange[0]?.toFixed(0)} - ₱{localPriceRange[1]?.toFixed(0)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10000}
                  step={10}
                  value={localPriceRange[1]}
                  onValueChange={(value) => handlePriceRangeChange([localPriceRange[0], value])}
                  minimumTrackTintColor="#38761d"
                  maximumTrackTintColor="#E5E7EB"
                />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  step={10}
                  value={localPriceRange[0]}
                  onValueChange={(value) => handlePriceRangeChange([value, localPriceRange[1]])}
                  minimumTrackTintColor="#38761d"
                  maximumTrackTintColor="#E5E7EB"
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#EEF2FF',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#38761d',
  },
  categoryChipText: {
    color: '#4B5563',
    fontSize: 14,
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  priceRangeContainer: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  applyButton: {
    backgroundColor: '#38761d',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchFilter;