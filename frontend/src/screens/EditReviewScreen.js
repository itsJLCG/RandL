import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { Rating } from 'react-native-ratings';
import { updateReview } from '../actions/reviewActions';

const EditReviewScreen = ({ route, navigation }) => {
    const { review } = route.params;
    const dispatch = useDispatch();
    const [rating, setRating] = useState(review.rating);
    const [comment, setComment] = useState(review.comment);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    try {
      await dispatch(updateReview(review._id, { rating, comment }));
      Alert.alert('Success', 'Review updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update review');
    }
  };

return (
    <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.productCard}>
                <Text style={[styles.subtitle, { alignSelf: 'flex-start' }]}>Product Name</Text>
                <Text style={styles.productName}>{review.product?.name}</Text>
            </View>

            <View style={styles.ratingContainer}>
                <Text style={styles.subtitle}>Update Rating</Text>
                <Rating
                    startingValue={rating}
                    onFinishRating={setRating}
                    style={{ paddingVertical: 10 }}
                    imageSize={30}
                />
            </View>

            <View style={styles.commentContainer}>
                <Text style={styles.subtitle}>Update Review</Text>
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
                onPress={handleSubmit}
            >
                <Text style={styles.submitButtonText}>Update Review</Text>
            </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  commentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#38761d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditReviewScreen;