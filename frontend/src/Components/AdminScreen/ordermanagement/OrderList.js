// CVPetShop/frontend/src/Components/AdminScreen/ordermanagement/OrderList.js
import React, { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../../../utils/helper';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AdminDrawer from '../AdminDrawer';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const THEME = {
  bg: '#F3F8FC',
  card: '#FFFFFF',
  border: '#D7E5F2',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  accent: '#0EA5E9',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
};

export default function OrderListScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleDelete = (order) => {
    Alert.alert(
      'Delete Order',
      `Are you sure you want to delete order #${order._id.slice(-6)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${BACKEND_URL}/api/v1/admin/orders/${order._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Success', 'Order deleted successfully');
              fetchOrders();
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Error', 'Failed to delete order');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = (order) => {
    navigation.navigate('UpdateOrder', { order });
  };

  const handleView = (order) => {
    navigation.navigate('ViewOrder', { orderId: order._id });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return THEME.success;
      case 'Out for Delivery':
        return THEME.warning;
      case 'Processing':
        return THEME.accent;
      case 'Accepted':
        return '#22C55E';
      case 'Cancelled':
        return THEME.danger;
      default:
        return '#94A3B8';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderRightActions = (order) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeButton, styles.updateButton]}
        onPress={() => handleUpdateStatus(order)}
      >
        <Icon name="update" size={24} color="white" />
        <Text style={styles.swipeButtonText}>Update</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, styles.deleteButton]}
        onPress={() => handleDelete(order)}
      >
        <Icon name="delete" size={24} color="white" />
        <Text style={styles.swipeButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleView(item)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item._id.slice(-8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
            <Text style={styles.statusText}>{item.orderStatus}</Text>
          </View>
        </View>
        
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Icon name="person" size={16} color={THEME.textMuted} />
            <Text style={styles.infoText}>{item.user?.name || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="email" size={16} color={THEME.textMuted} />
            <Text style={styles.infoText}>{item.user?.email || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="attach-money" size={16} color={THEME.textMuted} />
            <Text style={styles.infoText}>₱{item.totalAmount?.toFixed(2)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="event" size={16} color={THEME.textMuted} />
            <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
          </View>
          
          <View style={styles.itemsPreview}>
            <Text style={styles.itemsPreviewText}>
              {item.orderItems?.length} item(s)
            </Text>
          </View>
        </View>
        
        <Icon name="chevron-right" size={24} color={THEME.textMuted} />
      </TouchableOpacity>
    </Swipeable>
  );

  const OrderListContent = () => (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="shopping-cart" size={80} color={THEME.textMuted} />
            <Text style={styles.emptyText}>No orders found</Text>
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
      <OrderListContent />
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
    backgroundColor: THEME.bg,
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: THEME.textSecondary,
  },
  itemsPreview: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  itemsPreviewText: {
    fontSize: 13,
    color: THEME.textMuted,
    fontStyle: 'italic',
  },
  swipeActions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  swipeButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 5,
    height: '100%',
  },
  updateButton: {
    backgroundColor: THEME.warning,
  },
  deleteButton: {
    backgroundColor: THEME.danger,
  },
  swipeButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.textMuted,
    marginTop: 10,
  },
});
