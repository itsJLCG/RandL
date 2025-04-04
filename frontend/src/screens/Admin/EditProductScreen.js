import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { uploadImageToCloudinary } from '../../utils/imageUpload';
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
    Modal,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateProduct } from '../../actions/productActions';
import { fetchCategories } from '../../actions/categoryActions';

const EditProductScreen = ({ route, navigation }) => {
    const { product: initialProduct } = route.params;

    // Initialize image states correctly
    const [imageUri, setImageUri] = useState(null);
    const [imageData, setImageData] = useState(initialProduct?.image || null);

    // Add useEffect to handle image data updates
    useEffect(() => {
        if (initialProduct?.image?.url) {
            setImageData(initialProduct.image);
            console.log('Setting initial image:', initialProduct.image);
        }
    }, [initialProduct]);

    const dispatch = useDispatch();
    const { categories } = useSelector(state => state.categories);
    const [isLoading, setIsLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Initialize with proper category handling
    const [product, setProduct] = useState({
        name: initialProduct.name || '',
        price: initialProduct.price?.toString() || '',
        description: initialProduct.description || '',
        category: initialProduct.category?._id || initialProduct.category || ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(fetchCategories());
        console.log('Initial Product:', initialProduct);
        console.log('Initial Category:', initialProduct.category);
    }, [dispatch]);

    const validateForm = () => {
        let tempErrors = {};
        if (!product.name.trim()) tempErrors.name = 'Product name is required';
        if (!product.price) tempErrors.price = 'Price is required';
        if (isNaN(parseFloat(product.price))) tempErrors.price = 'Price must be a number';
        if (!product.description.trim()) tempErrors.description = 'Description is required';
        if (!product.category) tempErrors.category = 'Category is required';

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSelectCategory = (category) => {
        console.log('Selected category:', category);
        setProduct(prev => ({
            ...prev,
            category: category._id
        }));
        setShowCategoryModal(false);
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]?.uri) {
                const uri = result.assets[0].uri;
                if (typeof uri === 'string') {
                    setImageUri(uri);
                    setImageData(null); // Reset image data since we'll upload new image
                }
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Sorry, we need camera permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
                setImageData(null);
            }
        } catch (error) {
            Alert.alert('Error taking photo');
        }
    };
    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                setIsLoading(true);
    
                let finalImageData = imageData;
    
                if (imageUri) {
                    console.log('Uploading new image...');
                    const uploadResult = await uploadImageToCloudinary(imageUri);
                    console.log('Upload result:', uploadResult);
    
                    if (!uploadResult.success) {
                        Alert.alert('Error', uploadResult.message || 'Failed to upload image');
                        setIsLoading(false);
                        return;
                    }
    
                    finalImageData = {
                        public_id: uploadResult.public_id,
                        url: uploadResult.url
                    };
                }
    
                const updatedProduct = {
                    name: product.name,
                    price: parseFloat(product.price),
                    description: product.description,
                    category: product.category,
                    image: finalImageData
                };
    
                console.log('Updating product with data:', updatedProduct);
    
                const result = await dispatch(updateProduct(initialProduct._id, updatedProduct));
    
                if (result.success) {
                    // Update local states with the new data
                    setImageData(finalImageData);
                    setImageUri(null);
    
                    Alert.alert(
                        'Success',
                        'Product updated successfully',
                        [{
                            text: 'OK',
                            onPress: () => {
                                // Force a refresh of the product data
                                navigation.goBack();
                                navigation.navigate('EditProduct', {
                                    product: {
                                        ...initialProduct,
                                        ...updatedProduct,
                                        image: finalImageData
                                    }
                                });
                            }
                        }]
                    );
                } else {
                    Alert.alert('Error', result.message || 'Failed to update product');
                }
            } catch (error) {
                console.error('Update error:', error);
                Alert.alert('Error', 'Failed to update product');
            } finally {
                setIsLoading(false);
            }
        }
    };
    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                product.category === item._id && styles.selectedCategoryItem
            ]}
            onPress={() => handleSelectCategory(item)}
        >
            <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDescription} numberOfLines={1}>
                    {item.description}
                </Text>
            </View>
            {product.category === item._id && (
                <Ionicons name="checkmark" size={20} color="#38761d" />
            )}
        </TouchableOpacity>
    );

    const selectedCategory = categories?.find(cat =>
        cat._id === product.category ||
        cat._id === initialProduct.category?._id
    );

    useEffect(() => {
        console.log('Image states updated:', {
            imageUri,
            imageData: imageData?.url,
            initialImage: initialProduct?.image?.url
        });
    }, [imageUri, imageData, initialProduct]);
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#38761d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Product</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Product Name</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            value={product.name}
                            onChangeText={(text) => setProduct({ ...product, name: text })}
                            placeholder="Enter product name"
                            placeholderTextColor="#9CA3AF"
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price</Text>
                        <TextInput
                            style={[styles.input, errors.price && styles.inputError]}
                            value={product.price}
                            onChangeText={(text) => setProduct({ ...product, price: text })}
                            placeholder="Enter price"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="decimal-pad"
                        />
                        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TouchableOpacity
                            style={[styles.categorySelector, errors.category && styles.inputError]}
                            onPress={() => setShowCategoryModal(true)}
                        >
                            <Text style={[
                                styles.categorySelectorText,
                                selectedCategory ? styles.selectedCategory : styles.placeholderText
                            ]}>
                                {selectedCategory ? selectedCategory.name : 'Select a category'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                            value={product.description}
                            onChangeText={(text) => setProduct({ ...product, description: text })}
                            placeholder="Enter product description"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
    <Text style={styles.label}>Product Image</Text>
    <View style={styles.imageContainer}>
        {(imageUri || imageData?.url) ? (
            <Image
                source={{
                    uri: imageUri || imageData?.url,
                    // Force image refresh
                    cache: 'reload',
                    headers: {
                        Pragma: 'no-cache'
                    }
                }}
                style={styles.imagePreview}
                resizeMode="contain"
                onLoadStart={() => console.log('Image loading started')}
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => {
                    console.log('Image loading error:', e.nativeEvent.error);
                    console.log('Attempted URI:', imageUri || imageData?.url);
                }}
            />
        ) : (
            <View style={[styles.imagePreview, styles.noImage]}>
                <Text style={styles.noImageText}>No image selected</Text>
            </View>
        )}
                            <View style={styles.imageButtons}>
                                <TouchableOpacity
                                    style={styles.imageButton}
                                    onPress={pickImage}
                                >
                                    <Ionicons name="images-outline" size={24} color="#38761d" />
                                    <Text style={styles.imageButtonText}>Pick Image</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.imageButton}
                                    onPress={takePhoto}
                                >
                                    <Ionicons name="camera-outline" size={24} color="#38761d" />
                                    <Text style={styles.imageButtonText}>Take Photo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryModal(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={categories}
                            renderItem={renderCategoryItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.categoryList}
                        />
                    </View>
                </View>
            </Modal>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Update Product</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
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
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    categorySelector: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categorySelectorText: {
        fontSize: 16,
        color: '#1F2937',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    selectedCategory: {
        color: '#1F2937',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    categoryList: {
        padding: 16,
    },
    selectedCategoryItem: {
        backgroundColor: '#F3F4F6',
    },
    categoryContent: {
        flex: 1,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
        padding: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    submitButton: {
        flex: 1,
        padding: 12,
        marginLeft: 8,
        backgroundColor: '#38761d',
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePreview: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center',
    },
    imageButtonText: {
        marginLeft: 8,
        color: '#38761d',
        fontSize: 14,
        fontWeight: '500',
    },
    noImage: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
    },
    noImageText: {
        color: '#6B7280',
        fontSize: 14,
    },
});

export default EditProductScreen;