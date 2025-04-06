import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { Text } from 'react-native-paper';
import { Table, Row, Rows } from 'react-native-table-component';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPromotions, deletePromotion } from '../../actions/promotionActions';

const ManagePromotionsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { promotions, error, isLoading } = useSelector(state => state.promotions);
  const [tableHead] = useState(['Title', 'Discount', 'Status', 'Actions']);
  const [widthArr] = useState([140, 80, 80, 100]);

  useEffect(() => {
    dispatch(fetchPromotions());
  }, [dispatch]);

  const handleAddPromotion = () => {
    navigation.navigate('AddPromotion');
  };

  const handleDeletePromotion = (promotionId) => {
    Alert.alert(
      'Delete Promotion',
      'Are you sure you want to delete this promotion?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dispatch(deletePromotion(promotionId));
              if (result.success) {
                Alert.alert('Success', 'Promotion deleted successfully');
              } else {
                Alert.alert('Error', result.message || 'Failed to delete promotion');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete promotion');
            }
          }
        }
      ]
    );
  };

  const handleEditPromotion = (promotion) => {
    navigation.navigate('EditPromotion', { promotion });
  };

  const renderActionButtons = (item) => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditPromotion(item)}
      >
        <Ionicons name="create-outline" size={20} color="#38761d" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePromotion(item._id)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  // Format discount to show percentage
  const formatDiscount = (discount) => `${discount}%`;

  // Render status with colored indicator
  const renderStatus = (isActive) => (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#6B7280' }]} />
      <Text style={styles.statusText}>{isActive ? 'Active' : 'Inactive'}</Text>
    </View>
  );

  const tableData = promotions && promotions.map(item => [
    item.title,
    formatDiscount(item.discountPercentage),
    renderStatus(item.isActive),
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
        <Text style={styles.headerTitle}>Manage Promotions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPromotion}
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
                  textStyle={styles.tableHeaderText}
                />
              </Table>
              <ScrollView style={styles.dataWrapper}>
                <Table borderStyle={styles.tableBorder}>
                  <Rows
                    data={tableData}
                    widthArr={widthArr}
                    style={styles.row}
                  />
                </Table>
              </ScrollView>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tableHeader: {
    height: 50,
    backgroundColor: '#F3F4F6',
  },
  tableHeaderText: {
    textAlign: 'left',
    fontWeight: '600',
    fontSize: 14,
    color: '#4B5563',
    paddingLeft: 8,
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: {
    textAlign: 'left',
    fontSize: 14,
    color: '#4B5563',
    paddingLeft: 8,
  },
  row: {
    height: 60,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
  }
});

export default ManagePromotionsScreen;