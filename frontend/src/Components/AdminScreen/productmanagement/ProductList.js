// C&V PetShop/frontend/src/Components/AdminScreen/productmanagement/ProductList.js
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
  warning: '#D97706',
};

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${BACKEND_URL}/api/v1/admin/products/${product._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Success', 'Product deleted successfully');
              fetchProducts();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (product) => {
    navigation.navigate('UpdateProduct', { product });
  };

  const handleView = (product) => {
    navigation.navigate('ViewProduct', { productId: product._id });
  };

  const handleGoToTrash = () => {
    navigation.navigate('TrashProduct');
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
        style={[styles.swipeButton, styles.editButton]}
        onPress={() => handleEdit(product)}
      >
        <Icon name="edit" size={24} color="white" />
        <Text style={styles.swipeButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, styles.deleteButton]}
        onPress={() => handleDelete(product)}
      >
        <Icon name="delete" size={24} color="white" />
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
          onPress={() => handleView(item)}
        >
          <Image
            source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100' }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            
            {/* Price with discount display */}
            <View style={styles.priceContainer}>
              {item.isOnSale && item.discountedPrice ? (
                <>
                  <Text style={styles.originalPrice}>₱{originalPrice}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {item.discountPercentage ? `${item.discountPercentage}% OFF` : 'SALE'}
                    </Text>
                  </View>
                  <Text style={styles.discountedPrice}>₱{displayPrice}</Text>
                </>
              ) : (
                <Text style={styles.productPrice}>₱{displayPrice}</Text>
              )}
            </View>
            
            <Text style={styles.productCategory}>{item.category}</Text>
            <View style={styles.productMeta}>
              <Text style={styles.stockText}>
                Stock: <Text style={item.stock > 0 ? styles.inStock : styles.outOfStock}>
                  {item.stock}
                </Text>
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color={THEME.warning} />
                <Text style={styles.ratingText}>{item.ratings?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.reviewCount}>({item.numOfReviews || 0})</Text>
              </View>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={THEME.textMuted} />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Main content of ProductList screen
  const ProductListContent = () => (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={80} color={THEME.textMuted} />
            <Text style={styles.emptyText}>No products found</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateProduct')}
            >
              <Text style={styles.emptyButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.trashButton]}
          onPress={handleGoToTrash}
        >
          <Icon name="delete" size={24} color="#fff" />
          <View style={styles.fabLabel}>
            <Text style={styles.fabLabelText}>Trash</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.fab, styles.addButton]}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Icon name="add" size={24} color="#fff" />
          <View style={styles.fabLabel}>
            <Text style={styles.fabLabelText}>Create</Text>
          </View>
        </TouchableOpacity>
      </View>
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
      <ProductListContent />
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
    paddingBottom: 100,
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
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: THEME.textPrimary,
  },
  // Price styles
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.success,
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
    color: THEME.success,
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
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  inStock: {
    color: THEME.success,
    fontWeight: 'bold',
  },
  outOfStock: {
    color: THEME.danger,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 2,
    marginRight: 2,
    color: THEME.warning,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 10,
    color: THEME.textMuted,
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
  editButton: {
    backgroundColor: THEME.accent,
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
    color: THEME.textSecondary,
    marginTop: 10,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 100,
  },
  addButton: {
    backgroundColor: THEME.accent,
  },
  trashButton: {
    backgroundColor: THEME.danger,
  },
  fabLabel: {
    marginLeft: 8,
  },
  fabLabelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
