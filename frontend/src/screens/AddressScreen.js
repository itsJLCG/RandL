import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

const AddressScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [address, setAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
  });

  useEffect(() => {
    console.log('User data:', user); // Add this to see all user data
    
    if (route.params?.selectedAddress) {
      console.log('Selected address:', route.params.selectedAddress);
      setAddress(route.params.selectedAddress);
    } 
    else if (user) {
      console.log('Setting address from user:', {
        name: user.name,
        address: user.address
      });
      
      setAddress(prevAddress => ({
        ...prevAddress,
        name: user.name || '',
        address: user.address || '', // Changed from 'street' to 'address'
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
      }));
    }
  }, [route.params?.selectedAddress, user]);

  const handleSave = async () => {
    // Validate all fields
    const requiredFields = ['name', 'address', 'city', 'state', 'zip', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Return address back to checkout screen
      navigation.navigate('Checkout', { selectedAddress: address });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#38761d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Address</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: user?.name ? '#F3F4F6' : '#FFFFFF' }]}
            value={address.name}
            onChangeText={(text) => setAddress(prev => ({ ...prev, name: text }))}
            placeholder="Enter full name"
            editable={!user?.name} // Make it non-editable if prefilled
          />
        </View>

        <View style={styles.inputGroup}>
  <Text style={styles.label}>Street Address</Text>
  <TextInput
    style={[styles.input, { backgroundColor: user?.address ? '#F3F4F6' : '#FFFFFF' }]}
    value={address.address} // This is now correct
    onChangeText={(text) => setAddress(prev => ({ ...prev, address: text }))}
    placeholder="Enter street address"
    editable={!user?.address}
  />
</View>

        {/* Keep the rest of the input fields as they were */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={address.city}
              onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
              placeholder="City"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={address.state}
              onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
              placeholder="State"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>ZIP Code</Text>
            <TextInput
              style={styles.input}
              value={address.zip}
              onChangeText={(text) => setAddress(prev => ({ ...prev, zip: text }))}
              placeholder="ZIP Code"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={address.country}
              onChangeText={(text) => setAddress(prev => ({ ...prev, country: text }))}
              placeholder="Country"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={address.phone}
            onChangeText={(text) => setAddress(prev => ({ ...prev, phone: text }))}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Address</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#38761d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressScreen;