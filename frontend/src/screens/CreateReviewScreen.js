import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { Rating } from 'react-native-ratings';
import { useDispatch } from 'react-redux';
import { createReview } from '../actions/reviewActions';

const CreateReviewScreen = ({ route, navigation }) => {
  const { orderItems } = route.params;
  console.log('Order Items received:', orderItems);
  const dispatch = useDispatch();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

    // Add this log when selecting a product
    const handleProductSelect = (item) => {
        console.log('Selected product:', item);
        setSelectedProduct(item);
      };

// Update the handleSubmitReview function
const handleSubmitReview = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product to review');
      return;
    }
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }
  
    try {
      // Update this part to use the correct product ID
      await dispatch(createReview({
        productId: selectedProduct.product, // Change from selectedProduct._id to selectedProduct.product
        rating,
        comment
      }));
      Alert.alert('Success', 'Review submitted successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Write a Review</Text>
      
      <Text style={styles.subtitle}>Select Product to Review</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {orderItems.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[
              styles.productCard,
              selectedProduct?.product === item.product && styles.selectedProduct
            ]}
            onPress={() => handleProductSelect(item)}
          >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.ratingContainer}>
        <Text style={styles.subtitle}>Rating</Text>
        <Rating
          startingValue={rating}
          onFinishRating={setRating}
          style={{ paddingVertical: 10 }}
        />
      </View>

      <View style={styles.commentContainer}>
        <Text style={styles.subtitle}>Your Review</Text>
        <TextInput
          style={styles.commentInput}
          multiline
          numberOfLines={4}
          placeholder="Write your review here..."
          value={comment}
          onChangeText={setComment}
        />
      </View>

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmitReview}
      >
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10
  },
  productCard: {
    width: 120,
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedProduct: {
    borderColor: '#38761d',
    backgroundColor: '#f0f9f0'
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain'
  },
  productName: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center'
  },
  ratingContainer: {
    marginVertical: 20
  },
  commentContainer: {
    marginVertical: 20
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#38761d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default CreateReviewScreen;