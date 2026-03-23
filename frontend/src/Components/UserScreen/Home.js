// C&V PetShop/frontend/src/Components/UserScreen/Home.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { getUser, getToken } from '../../utils/helper';
import UserDrawer from './UserDrawer';
import Header from '../layouts/Header';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 180;
const IS_COMPACT_SCREEN = SCREEN_WIDTH <= 360;
const CTA_ICON_SIZE = IS_COMPACT_SCREEN ? 16 : 18;

const THEME = {
  bg: '#F3F8FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FCFF',
  border: '#D7E5F2',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  accent: '#0EA5E9',
  accentSoft: '#E0F2FE',
};

const BANNERS = [
  require('../sliding/headset.jpg'),
  require('../sliding/laptop.jpg'),
  require('../sliding/nintendo.jpg'),
  require('../sliding/ps5.jpg'),
];

// ─── Product Image Carousel ───────────────────────────────────────────────────
const ProductImageCarousel = ({ images, onCardPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images && images.length > 0 && images.some(img => img && (img.url || typeof img === 'string'));
  const urls = validImages 
    ? images.filter(img => img && (img.url || typeof img === 'string')).map(img => img.url || img) 
    : [];

  if (!validImages || urls.length === 0) {
    return (
      <TouchableOpacity onPress={onCardPress} activeOpacity={0.85} style={styles.noImage}>
        <Icon name="set-meal" size={40} color={THEME.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.imageCarouselContainer}>
      <TouchableOpacity onPress={onCardPress} activeOpacity={0.85} style={{ flex: 1 }}>
        <Image source={{ uri: urls[currentIndex] }} style={styles.productImage} resizeMode="cover" />
      </TouchableOpacity>

      {urls.length > 1 && (
        <>
          <TouchableOpacity
            style={styles.arrowLeft}
            onPress={() => setCurrentIndex(p => (p === 0 ? urls.length - 1 : p - 1))}
            activeOpacity={0.7}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowRight}
            onPress={() => setCurrentIndex(p => (p === urls.length - 1 ? 0 : p + 1))}
            activeOpacity={0.7}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
          <View style={styles.imageIndicatorContainer} pointerEvents="none">
            {urls.map((_, i) => (
              <View key={i} style={[styles.imageIndicatorDot, i === currentIndex && styles.imageIndicatorDotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// ─── Star Rating Component ───────────────────────────────────────────────────
const StarRating = ({ rating, size = 12, showRating = false }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <View style={styles.starRatingContainer}>
      <View style={styles.starsRow}>
        {[...Array(fullStars)].map((_, i) => (
          <Icon key={`full-${i}`} name="star" size={size} color="#FFD700" />
        ))}
        {halfStar && <Icon name="star-half" size={size} color="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon key={`empty-${i}`} name="star-border" size={size} color={THEME.textMuted} />
        ))}
      </View>
      {showRating && <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>}
    </View>
  );
};

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, opacity }) => (
  <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
    <Text style={styles.toastText}>{message}</Text>
  </Animated.View>
);

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [user,             setUser]             = useState(null);
  const [products,         setProducts]         = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories,       setCategories]       = useState(['All']);
  const [sortAscending,    setSortAscending]    = useState(false);
  const [showCategories,   setShowCategories]   = useState(false);
  const [cart,             setCart]             = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [toastMessage,     setToastMessage]     = useState('');
  
  // Review states
  const [productReviews, setProductReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});

  // Notifications / Orders
  const [showNotifications, setShowNotifications] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const flatListRef    = useRef(null);
  const autoSlideTimer = useRef(null);
  const toastOpacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInitialData();
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  useEffect(() => { 
    filterAndSortProducts(); 
  }, [products, selectedCategory, searchQuery, sortAscending]);

  useEffect(() => {
    if (BANNERS.length > 1) startAutoSlide();
    return () => stopAutoSlide();
  }, [currentBannerIndex]);

  // Fetch reviews for all products when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      fetchAllProductReviews();
    }
  }, [products]);

  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideTimer.current = setInterval(() => {
      const next = (currentBannerIndex + 1) % BANNERS.length;
      flatListRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
      setCurrentBannerIndex(next);
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer.current) { clearInterval(autoSlideTimer.current); autoSlideTimer.current = null; }
  };

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== currentBannerIndex) setCurrentBannerIndex(idx);
  };

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const loadInitialData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
      const token = await getToken();
      if (!token) { navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); return; }
      await Promise.all([fetchProducts(), fetchCart(), fetchCategories(), fetchUserOrders()]);
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => { 
    setRefreshing(true); 
    await loadInitialData(); 
    await fetchAllProductReviews();
    await fetchUserOrders();
    setRefreshing(false); 
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/products`);
      if (res.data?.success) {
        setProducts(res.data.products || []);
        setFilteredProducts(res.data.products || []);
      }
    } catch (e) { console.error('Error fetching products:', e.message); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/categories`);
      if (res.data?.success) {
        const dbCategories = (res.data.categories || [])
          .map(item => item?.name)
          .filter(Boolean);
        setCategories(['All', ...dbCategories]);
      }
    } catch (e) {
      console.error('Error fetching categories:', e.message);
      setCategories(['All']);
    }
  };

  const fetchCart = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.cart) setCart(res.data.cart.items || []);
    } catch (e) { console.error('Error fetching cart:', e); }
  };

  // ── Fetch reviews for all products ────────────────────────────────────────
  const fetchAllProductReviews = async () => {
    if (!products || products.length === 0) return;
    
    const reviewPromises = products.map(product => 
      fetchProductReviews(product._id)
    );
    
    await Promise.all(reviewPromises);
  };

  const fetchProductReviews = async (productId) => {
    try {
      setLoadingReviews(prev => ({ ...prev, [productId]: true }));
      
      const response = await axios.get(`${BACKEND_URL}/api/v1/reviews?productId=${productId}`);
      
      if (response.data.success) {
        setProductReviews(prev => ({ 
          ...prev, 
          [productId]: response.data.reviews || [] 
        }));
      }
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      setProductReviews(prev => ({ ...prev, [productId]: [] }));
    } finally {
      setLoadingReviews(prev => ({ ...prev, [productId]: false }));
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    if (selectedCategory !== 'All') filtered = filtered.filter(p => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    
    // Sort products - if sorting by price, use the actual selling price (discounted if on sale)
    filtered.sort((a, b) => {
      const priceA = a.isOnSale && a.discountedPrice ? parseFloat(a.discountedPrice) : parseFloat(a.price || 0);
      const priceB = b.isOnSale && b.discountedPrice ? parseFloat(b.discountedPrice) : parseFloat(b.price || 0);
      return sortAscending ? priceA - priceB : priceB - priceA;
    });
    
    setFilteredProducts(filtered);
  };

  // ── Calculate average rating for a product ───────────────────────────────
  const getProductAverageRating = (productId) => {
    const reviews = productReviews[productId] || [];
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / reviews.length;
  };

  // ── POST /api/v1/cart/add — shows toast, updates local cart badge ─────────
  const handleAddToCart = async (product) => {
    try {
      const token = await getToken();
      if (!token) { navigation.navigate('Login'); return; }

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/cart/add`,
        { productId: product._id },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCart(res.data.cart.items || []);
        showToast(`✅ "${product.name}" added to cart!`);
      }
    } catch (e) {
      console.error('Error adding to cart:', e);
      showToast(`❌ ${e.response?.data?.message || e.message}`);
    }
  };

  // Updated Buy Now to go directly to Checkout
  const handleBuyNow = (product) => {
    navigation.navigate('Checkout', {
      productId: product._id,
      quantity: 1,
      product: {
        ...product,
        // Pass the effective price
        effectivePrice: product.isOnSale && product.discountedPrice ? product.discountedPrice : product.price
      },
    });
  };

  const handleProductPress = (product) => navigation.navigate('SingleProduct', { productId: product._id });
  const toggleSort         = () => setSortAscending(p => !p);
  const selectCategory     = (cat) => { setSelectedCategory(cat); setShowCategories(false); };

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerContainer}>
      <Image source={item} style={styles.bannerImage} />
    </View>
  );

  const renderProductItem = ({ item }) => {
    // Determine which price to display
    const displayPrice = item.isOnSale && item.discountedPrice 
      ? parseFloat(item.discountedPrice).toFixed(2) 
      : parseFloat(item.price || 0).toFixed(2);
    
    const originalPrice = item.isOnSale && item.discountedPrice 
      ? parseFloat(item.price).toFixed(2) 
      : null;

    // Get product reviews and average rating
    const averageRating = getProductAverageRating(item._id);
    const reviewCount = (productReviews[item._id] || []).length;
    const isLoadingReview = loadingReviews[item._id];

    return (
      <View style={styles.productCard}>
        <View style={styles.imageContainer}>
          <ProductImageCarousel images={item.images} onCardPress={() => handleProductPress(item)} />
        </View>

        <TouchableOpacity onPress={() => handleProductPress(item)} activeOpacity={0.85}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productCategory} numberOfLines={1}>{item.category || 'Uncategorized'}</Text>
            
            {/* Rating Display */}
            {!isLoadingReview && reviewCount > 0 ? (
              <View style={styles.reviewSummaryContainer}>
                <StarRating rating={averageRating} size={12} showRating={true} />
                <Text style={styles.reviewCount}>({reviewCount})</Text>
              </View>
            ) : isLoadingReview ? (
              <ActivityIndicator size="small" color={THEME.accent} style={styles.reviewLoader} />
            ) : null}
            
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
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <View style={[styles.buttonSlot, styles.buttonSlotLeft]}>
            <TouchableOpacity style={[styles.cartButton, IS_COMPACT_SCREEN && styles.compactButton]} onPress={() => handleAddToCart(item)} activeOpacity={0.85}>
              <Icon name="add-shopping-cart" size={CTA_ICON_SIZE} color="#0EA5E9" />
              <Text style={styles.cartButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Cart</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.buttonSlot, styles.buttonSlotRight]}>
            <TouchableOpacity style={[styles.buyButton, IS_COMPACT_SCREEN && styles.compactButton]} onPress={() => handleBuyNow(item)} activeOpacity={0.85}>
              <Icon name="shopping-cart-checkout" size={CTA_ICON_SIZE} color="white" />
              <Text style={styles.buyButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory === item && styles.selectedCategoryItem]}
      onPress={() => selectCategory(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryItemText, selectedCategory === item && styles.selectedCategoryItemText]}>
        {item}
      </Text>
          {selectedCategory === item && <Icon name="check" size={18} color={THEME.accent} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.accent} />
      </View>
    );
  }

  return (
    <UserDrawer>
      <View style={styles.container}>
        <Header />

        <View style={styles.notificationRow}>
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.8}
            onPress={() => {
              setShowNotifications(true);
              fetchUserOrders();
            }}
          >
            <Icon name="notifications" size={18} color={THEME.accent} />
            <Text style={styles.notificationText}>Notifications</Text>
            {orders.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{orders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={THEME.accent} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for game accessories, smartphones, laptops..."
              placeholderTextColor={THEME.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={20} color={THEME.accent} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.bannerWrapper}>
            <FlatList
              ref={flatListRef}
              data={BANNERS}
              renderItem={renderBannerItem}
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onScrollBeginDrag={stopAutoSlide}
              onScrollEndDrag={startAutoSlide}
            />
            <View style={styles.indicatorContainer}>
              {BANNERS.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    flatListRef.current?.scrollToOffset({ offset: idx * SCREEN_WIDTH, animated: true });
                    setCurrentBannerIndex(idx);
                  }}
                >
                  <View style={[styles.indicator, currentBannerIndex === idx && styles.activeIndicator]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.categorySelector} onPress={() => setShowCategories(true)} activeOpacity={0.7}>
              <Icon name="category" size={20} color={THEME.accent} />
              <Text style={styles.categorySelectorText} numberOfLines={1}>{selectedCategory}</Text>
              <Icon name="arrow-drop-down" size={24} color={THEME.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.priceFilterButton} onPress={toggleSort}>
              <Icon name="attach-money" size={20} color={THEME.accent} />
              <Text style={styles.priceFilterText} numberOfLines={1}>Price {sortAscending ? '↑' : '↓'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsHeader}>
            <Text style={styles.productsTitle}>Fresh Catch</Text>
            <Text style={styles.productCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {filteredProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {filteredProducts.map(item => (
                <View key={item._id} style={styles.gridItem}>
                  {renderProductItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={60} color={THEME.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try different search or category</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <Toast message={toastMessage} opacity={toastOpacity} />

        <Modal
          visible={showNotifications}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotifications(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowNotifications(false)}
          >
            <View style={styles.notificationsDropdown}>
              <Text style={styles.categoriesTitle}>Order Notifications</Text>

              {loadingOrders ? (
                <View style={styles.notificationsEmpty}>
                  <ActivityIndicator size="small" color={THEME.accent} />
                </View>
              ) : orders.length === 0 ? (
                <View style={styles.notificationsEmpty}>
                  <Text style={styles.emptySubtext}>No order notifications yet.</Text>
                </View>
              ) : (
                <FlatList
                  data={orders}
                  keyExtractor={(item, i) => item?._id || item?.id || String(i)}
                  style={styles.categoriesList}
                  renderItem={({ item }) => {
                    const id = item?._id || item?.id || 'N/A';
                    const status = item?.status || 'Pending';
                    const total = Number(item?.totalAmount ?? item?.total ?? 0).toFixed(2);
                    const createdAt = item?.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A';
                    const count = Array.isArray(item?.items)
                      ? item.items.length
                      : Array.isArray(item?.orderItems)
                      ? item.orderItems.length
                      : 0;

                    return (
                      <View style={styles.orderNotificationItem}>
                        <Text style={styles.orderNotificationTitle}>Order #{String(id).slice(-8)}</Text>
                        <Text style={styles.orderNotificationMeta}>Status: {status}</Text>
                        <Text style={styles.orderNotificationMeta}>Total: ₱{total}</Text>
                        <Text style={styles.orderNotificationMeta}>Items: {count}</Text>
                        <Text style={styles.orderNotificationDate}>{createdAt}</Text>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showCategories} transparent animationType="fade" onRequestClose={() => setShowCategories(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategories(false)}>
            <View style={styles.categoriesDropdown}>
              <Text style={styles.categoriesTitle}>Select Category</Text>
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(_, i) => i.toString()}
                style={styles.categoriesList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </UserDrawer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg },
  scrollView: { flex: 1 },
  toast: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: '#EAF6FF',
    paddingHorizontal: 18, paddingVertical: 12,
    borderWidth: 1, borderColor: '#BAE6FD',
    alignItems: 'center',
    zIndex: 999, elevation: 10,
    shadowColor: '#0C4A6E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 10,
  },
  toastText: { color: THEME.textPrimary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface,
    marginHorizontal: 16, marginTop: 15, marginBottom: 15,
    paddingHorizontal: 15, borderWidth: 1, borderColor: THEME.border, borderRadius: 12,
    elevation: 2, shadowColor: '#0C4A6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: THEME.textPrimary },
  bannerWrapper: { height: BANNER_HEIGHT, marginBottom: 15, position: 'relative' },
  bannerContainer: { width: SCREEN_WIDTH, height: BANNER_HEIGHT },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  indicatorContainer: {
    position: 'absolute', bottom: 10, width: '100%',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  indicator: { width: 8, height: 8, backgroundColor: 'rgba(15, 23, 42, 0.25)', marginHorizontal: 4, borderRadius: 5 },
  activeIndicator: { backgroundColor: THEME.accent, width: 12, height: 12 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
  categorySelector: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: THEME.border, borderRadius: 10, flex: 0.48,
  },
  categorySelectorText: { fontSize: 13, color: THEME.textSecondary, marginHorizontal: 6, flex: 1, fontWeight: '500' },
  priceFilterButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: THEME.surface, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: THEME.border, borderRadius: 10, flex: 0.48,
  },
  priceFilterText: { fontSize: 13, color: THEME.textSecondary, marginLeft: 5, fontWeight: '500' },
  productsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 15 },
  productsTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.textPrimary, letterSpacing: 0.3 },
  productCount: { fontSize: 13, color: THEME.textMuted },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  gridItem: { width: '50%', paddingHorizontal: 4 },
  productCard: {
    backgroundColor: THEME.surface, marginBottom: 15,
    borderWidth: 1, borderColor: THEME.border, borderRadius: 14,
    elevation: 2, shadowColor: '#0C4A6E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, overflow: 'hidden',
  },
  imageContainer: { height: 132, backgroundColor: '#EEF6FF', padding: 8 },
  imageCarouselContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CFE2F3',
    backgroundColor: THEME.surface,
  },
  productImage: { width: '100%', height: '100%' },
  noImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.surfaceSoft,
    borderRadius: 12,
  },
  arrowLeft: {
    position: 'absolute', left: 4, top: '50%', transform: [{ translateY: -16 }],
    backgroundColor: 'rgba(15, 23, 42, 0.45)', width: 26, height: 26, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  arrowRight: {
    position: 'absolute', right: 4, top: '50%', transform: [{ translateY: -16 }],
    backgroundColor: 'rgba(15, 23, 42, 0.45)', width: 26, height: 26, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  arrowText: { color: 'white', fontSize: 22, fontWeight: 'bold', lineHeight: 26 },
  imageIndicatorContainer: { position: 'absolute', bottom: 4, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  imageIndicatorDot: { width: 5, height: 5, backgroundColor: 'rgba(15, 23, 42, 0.25)', marginHorizontal: 2, borderRadius: 4 },
  imageIndicatorDotActive: { backgroundColor: THEME.accent, width: 7, height: 7 },
  productInfo: { padding: 10, flex: 1 },
  productName: { fontSize: 13, fontWeight: '600', color: THEME.textPrimary, marginBottom: 4, height: 40 },
  productCategory: { fontSize: 11, color: THEME.textMuted, marginBottom: 6 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: THEME.accent },
  // Review-related styles
  reviewSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: THEME.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: 10,
    color: THEME.textMuted,
    marginLeft: 2,
  },
  reviewLoader: {
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  // Discount-related styles
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 11,
    color: THEME.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  discountedPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.accent,
  },
  discountBadge: {
    backgroundColor: THEME.accentSoft,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: THEME.accent,
    fontSize: 9,
    fontWeight: 'bold',
  },
  actionButtons: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#D7E5F2', paddingHorizontal: 8, paddingVertical: 8 },
  buttonSlot: {
    flex: 1,
  },
  buttonSlotLeft: {
    marginRight: 4,
  },
  buttonSlotRight: {
    marginLeft: 4,
  },
  cartButton: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F7FBFF', paddingVertical: 10, paddingHorizontal: 6,
    borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 10, minHeight: 42,
  },
  cartButtonText: { fontSize: 11, fontWeight: '700', color: '#0EA5E9', marginLeft: 4 },
  buyButton: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0EA5E9', paddingVertical: 10, paddingHorizontal: 6, borderRadius: 10, minHeight: 42,
    shadowColor: '#0C4A6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 8, elevation: 3,
  },
  buyButtonText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', marginLeft: 4 },
  compactButton: {
    minHeight: 40,
    paddingVertical: 8,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: THEME.textSecondary, marginTop: 15, marginBottom: 5 },
  emptySubtext: { fontSize: 14, color: THEME.textMuted, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'flex-start', paddingTop: 120 },
  categoriesDropdown: {
    backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border,
    marginHorizontal: 20, maxHeight: 400,
    borderRadius: 12,
    elevation: 6, shadowColor: '#0C4A6E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 12,
  },
  categoriesTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.textPrimary, letterSpacing: 0.2, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  categoriesList: { maxHeight: 350 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
  selectedCategoryItem: { backgroundColor: '#EAF6FF' },
  categoryItemText: { fontSize: 15, color: THEME.textSecondary },
  selectedCategoryItemText: { color: THEME.accent, fontWeight: '600' },
  notificationRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  notificationText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  notificationBadge: {
    marginLeft: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationsDropdown: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    marginHorizontal: 20,
    maxHeight: 420,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  notificationsEmpty: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNotificationItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  orderNotificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  orderNotificationMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginBottom: 2,
  },
  orderNotificationDate: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 4,
  },
});
