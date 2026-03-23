// C&V PetShop/frontend/src/Components/AdminScreen/productmanagement/TrashProduct.js
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
  Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import axios from 'axios';
import { getToken } from '../../../utils/helper';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AdminDrawer from '../AdminDrawer';

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

export default function TrashProductScreen({ navigation }) {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeletedProducts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/admin/products/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching deleted products:', error);
      Alert.alert('Error', 'Failed to load deleted products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDeletedProducts();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeletedProducts();
  };

  const handlePermanentDelete = (product) => {
    Alert.alert(
      'Permanent Delete',
      `Are you sure you want to PERMANENTLY delete "${product.name}"? This will also delete all associated reviews and images. This action cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(
                `${BACKEND_URL}/api/v1/admin/products/delete/${product._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Alert.alert('Success', 'Product permanently deleted');
              fetchDeletedProducts();
            } catch (error) {
              console.error('Error permanently deleting product:', error);
              Alert.alert('Error', 'Failed to permanently delete product');
            }
          },
        },
      ]
    );
  };

  const handleRestore = async (product) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${BACKEND_URL}/api/v1/admin/products/restore/${product._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Success', 'Product restored successfully');
      fetchDeletedProducts();
      navigation.navigate('ProductList');
    } catch (error) {
      console.error('Error restoring product:', error);
      Alert.alert('Error', 'Failed to restore product');
    }
  };

  const showProductDetails = (product) => {
    const priceInfo = product.isOnSale && product.discountedPrice
      ? `Original Price: ₱${product.price}\nDiscounted Price: ₱${product.discountedPrice} (${product.discountPercentage || ''}% OFF)`
      : `Price: ₱${product.price}`;

    Alert.alert(
      'Deleted Product Details',
      `Name: ${product.name}\n${priceInfo}\nCategory: ${product.category}\nStock: ${product.stock}\nSupplier: ${product.supplier?.name || 'No Supplier'}\nReviews: ${product.numOfReviews || 0}\nDeleted on: ${new Date(product.updatedAt).toLocaleDateString()}`,
      [{ text: 'OK', style: 'default' }]
    );
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

  const renderRightActions = (product) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeButton, styles.restoreButton]}
        onPress={() => handleRestore(product)}
      >
        <Icon name="restore" size={24} color="white" />
        <Text style={styles.swipeButtonText}>Restore</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, styles.deleteButton]}
        onPress={() => handlePermanentDelete(product)}
      >
        <Icon name="delete-forever" size={24} color="white" />
        <Text style={styles.swipeButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => {
    // Determine which price to display
    const displayPrice = item.isOnSale && item.discountedPrice 
      ? parseFloat(item.discountedPrice).toFixed(2) 
      : parseFloat(item.price || 0).toFixed(2);
    
    const originalPrice = item.isOnSale && item.discountedPrice 
      ? parseFloat(item.price).toFixed(2) 
      : null;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => showProductDetails(item)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100' }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.deletedBadge}>
                <Text style={styles.deletedText}>DELETED</Text>
              </View>
            </View>
            
            <View style={styles.priceCategoryRow}>
              {/* Price with discount display */}
              <View style={styles.priceContainer}>
                {item.isOnSale && item.discountedPrice ? (
                  <>
                    <Text style={styles.originalPrice}>₱{originalPrice}</Text>
                    {item.discountPercentage && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>
                          {item.discountPercentage}% OFF
                        </Text>
                      </View>
                    )}
                    <Text style={styles.discountedPrice}>₱{displayPrice}</Text>
                  </>
                ) : (
                  <Text style={styles.productPrice}>₱{displayPrice}</Text>
                )}
              </View>
              <Text style={styles.productCategory}>{item.category}</Text>
            </View>

            <Text style={styles.supplierText}>
              Supplier: {item.supplier?.name || 'No Supplier'}
            </Text>
            <View style={styles.productMeta}>
              <View style={styles.stockContainer}>
                <Text style={styles.stockLabel}>Stock:</Text>
                <Text style={styles.stockValue}>{item.stock}</Text>
              </View>
              <View style={styles.reviewsContainer}>
                <Icon name="rate-review" size={14} color={THEME.accent} />
                <Text style={styles.reviewCount}>{item.numOfReviews || 0} reviews</Text>
              </View>
            </View>
            <Text style={styles.deletedDate}>
              Deleted on: {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          <Icon name="info" size={24} color={THEME.textMuted} />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const TrashProductContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deleted Products</Text>
        <Text style={styles.countBadge}>{deletedProducts.length}</Text>
      </View>

      <FlatList
        data={deletedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="delete-sweep" size={80} color={THEME.textMuted} />
            <Text style={styles.emptyTitle}>No Deleted Products</Text>
            <Text style={styles.emptySubtitle}>
              Trash bin is empty. All products are active.
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
      <TrashProductContent />
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
  productCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    borderLeftWidth: 4,
    borderLeftColor: THEME.danger,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 1,
    borderColor: THEME.border,
    opacity: 0.8,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
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
  priceCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.danger,
    textDecorationLine: 'line-through',
  },
  originalPrice: {
    fontSize: 14,
    color: THEME.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.danger,
  },
  discountBadge: {
    backgroundColor: THEME.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productCategory: {
    fontSize: 12,
    color: THEME.textSecondary,
    backgroundColor: THEME.cardSoft,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  supplierText: {
    fontSize: 13,
    color: THEME.textMuted,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 12,
    color: THEME.textMuted,
    marginRight: 4,
  },
  stockValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textMuted,
    textDecorationLine: 'line-through',
  },
  reviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 12,
    color: THEME.accent,
    marginLeft: 4,
  },
  deletedDate: {
    fontSize: 11,
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
