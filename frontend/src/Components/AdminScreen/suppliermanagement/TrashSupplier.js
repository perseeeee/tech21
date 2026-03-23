// CVPetShop/frontend/src/Components/AdminScreen/suppliermanagement/TrashSupplier.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import axios from 'axios';
import { getToken } from '../../../utils/helper';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AdminDrawer from '../AdminDrawer'; // Import AdminDrawer

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const THEME = {
  bg: '#F3F8FC',
  card: '#FFFFFF',
  cardSoft: '#F7FBFF',
  border: '#D7E5F2',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  accent: '#0EA5E9',
  danger: '#DC2626',
  success: '#16A34A',
};

export default function TrashSupplierScreen({ navigation }) {
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeletedSuppliers = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/admin/suppliers/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedSuppliers(res.data.suppliers || []);
    } catch (error) {
      console.error('Error fetching deleted suppliers:', error);
      Alert.alert('Error', 'Failed to load deleted suppliers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDeletedSuppliers();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchDeletedSuppliers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeletedSuppliers();
  };

  const handlePermanentDelete = (supplier) => {
    Alert.alert(
      'Permanent Delete',
      `Are you sure you want to PERMANENTLY delete "${supplier.name}"? This action cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(
                `${BACKEND_URL}/api/v1/admin/suppliers/delete/${supplier._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Alert.alert('Success', 'Supplier permanently deleted');
              fetchDeletedSuppliers();
            } catch (error) {
              console.error('Error permanently deleting supplier:', error);
              Alert.alert('Error', 'Failed to permanently delete supplier');
            }
          },
        },
      ]
    );
  };

  const handleRestore = async (supplier) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${BACKEND_URL}/api/v1/admin/suppliers/restore/${supplier._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Success', 'Supplier restored successfully');
      fetchDeletedSuppliers();
      navigation.navigate('SupplierList');
    } catch (error) {
      console.error('Error restoring supplier:', error);
      Alert.alert('Error', 'Failed to restore supplier');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            const { logout } = await import('../../../utils/helper');
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const showSupplierDetails = (supplier) => {
    const address = supplier.address || {};
    Alert.alert(
      'Deleted Supplier Details',
      `Name: ${supplier.name}\nEmail: ${supplier.email}\nPhone: ${supplier.phone}\nAddress: ${address.street || ''}, ${address.city || ''}\nState: ${address.state || ''}\nCountry: ${address.country || ''}\nZip Code: ${address.zipCode || ''}\nDeleted on: ${new Date(supplier.updatedAt).toLocaleDateString()}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderRightActions = (supplier) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeButton, styles.restoreButton]}
        onPress={() => handleRestore(supplier)}
      >
        <Icon name="restore" size={24} color="white" />
        <Text style={styles.swipeButtonText}>Restore</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, styles.deleteButton]}
        onPress={() => handlePermanentDelete(supplier)}
      >
        <Icon name="delete-forever" size={24} color="white" />
        <Text style={styles.swipeButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.supplierCard}
        onPress={() => showSupplierDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.supplierInfo}>
          <View style={styles.supplierHeader}>
            <Text style={styles.supplierName}>{item.name}</Text>
            <View style={styles.deletedBadge}>
              <Text style={styles.deletedText}>DELETED</Text>
            </View>
          </View>
          <Text style={styles.supplierEmail}>📧 {item.email}</Text>
          <Text style={styles.supplierPhone}>📞 {item.phone}</Text>
          <Text style={styles.supplierAddress}>
            📍 {item.address?.street || ''}, {item.address?.city || ''}
          </Text>
          <Text style={styles.deletedDate}>
            Deleted on: {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <Icon name="info" size={24} color={THEME.textMuted} />
      </TouchableOpacity>
    </Swipeable>
  );

  // Main content of TrashSupplier screen
  const TrashSupplierContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deleted Suppliers</Text>
        <Text style={styles.countBadge}>{deletedSuppliers.length}</Text>
      </View>

      <FlatList
        data={deletedSuppliers}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="delete-sweep" size={80} color={THEME.textMuted} />
            <Text style={styles.emptyTitle}>No Deleted Suppliers</Text>
            <Text style={styles.emptySubtitle}>
              Trash bin is empty. All suppliers are active.
            </Text>
          </View>
        }
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.accent} />
      </View>
    );
  }

  return (
    <AdminDrawer onLogout={handleLogout}>
      <TrashSupplierContent />
    </AdminDrawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: THEME.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    elevation: 3,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  supplierCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    borderLeftWidth: 4,
    borderLeftColor: THEME.danger,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    flex: 1,
    textDecorationLine: 'line-through',
  },
  deletedBadge: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  deletedText: {
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: 'bold',
  },
  supplierEmail: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 3,
  },
  supplierPhone: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 3,
  },
  supplierAddress: {
    fontSize: 14,
    color: THEME.textMuted,
    marginBottom: 5,
  },
  deletedDate: {
    fontSize: 12,
    color: '#B91C1C',
    fontStyle: 'italic',
  },
  swipeActions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  swipeButton: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 5,
  },
  restoreButton: {
    backgroundColor: THEME.success,
  },
  deleteButton: {
    backgroundColor: THEME.danger,
  },
  swipeButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textSecondary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
