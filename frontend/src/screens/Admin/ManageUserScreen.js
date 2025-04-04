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
} from 'react-native';
import { Text, Menu, Provider, Portal } from 'react-native-paper';
import { Table, Row, Rows } from 'react-native-table-component';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole, deleteUser } from '../../actions/userActions';

const ManageUsersScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { users, error, isLoading } = useSelector(state => state.users);
    const [tableHead] = useState(['Name', 'Email', 'Role', 'Image', 'Actions']);
    const [widthArr] = useState([120, 150, 100, 80, 100]);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const result = await dispatch(updateUserRole(userId, newRole));
            if (result.success) {
                Alert.alert('Success', 'User role updated successfully');
            } else {
                Alert.alert('Error', result.message || 'Failed to update user role');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update user role');
        }
    };

    const handleDeleteUser = (userId) => {
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await dispatch(deleteUser(userId));
                            if (result.success) {
                                Alert.alert('Success', 'User deleted successfully');
                            } else {
                                Alert.alert('Error', result.message || 'Failed to delete user');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const RoleMenu = ({ user }) => {
        const [menuVisible, setMenuVisible] = useState(false);
        
        return (
            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                    <TouchableOpacity
                        onPress={() => setMenuVisible(true)}
                        style={styles.roleButton}
                    >
                        <Text style={styles.roleText}>{user.role}</Text>
                        <Ionicons name="chevron-down" size={16} color="#4B5563" />
                    </TouchableOpacity>
                }
            >
                <Menu.Item
                    onPress={() => {
                        handleRoleChange(user._id, 'user');
                        setMenuVisible(false);
                    }}
                    title="User"
                />
                <Menu.Item
                    onPress={() => {
                        handleRoleChange(user._id, 'admin');
                        setMenuVisible(false);
                    }}
                    title="Admin"
                />
            </Menu>
        );
    };

    const renderActionButtons = (item) => (
        <View style={styles.actionButtons}>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(item._id)}
            >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    const renderImage = (imageData) => (
        <Image
            source={{ uri: imageData?.url || 'https://via.placeholder.com/80' }}
            style={styles.userImage}
            resizeMode="cover"
        />
    );

    const tableData = users?.map(item => [
        <Text key={`name-${item._id}`} style={styles.text}>{item.name}</Text>,
        <Text key={`email-${item._id}`} style={styles.text}>{item.email}</Text>,
        <RoleMenu key={`role-${item._id}`} user={item} />,
        renderImage(item.image),
        renderActionButtons(item)
    ]) || [];

    return (
        <Provider>
            <Portal.Host>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#38761d" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Users</Text>
                    <View style={styles.placeholder} />
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
            </Portal.Host>
        </Provider>
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
    roleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        minWidth: 80, // Add minimum width
        zIndex: 1, // Add zIndex
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
        zIndex: 1, // Add zIndex
    },
    roleText: {
        fontSize: 14,
        color: '#4B5563',
        marginRight: 4,
        textTransform: 'capitalize',
    },
    userImage: {
        width: 60,
        height: 60,
        borderRadius: 30, // Make it circular
        marginLeft: 8,
        marginVertical: 10,
    },
    placeholder: {
        width: 40, // Same width as back button for header alignment
    }
});

export default ManageUsersScreen;