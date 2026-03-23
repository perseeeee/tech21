// C&V PetShop/frontend/src/Components/AdminScreen/AdminDrawer.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

const THEME = {
  bg: '#F3F8FC',
  card: '#FFFFFF',
  border: '#D7E5F2',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  accent: '#0EA5E9',
  danger: '#DC2626',
};

const AdminDrawer = ({ children, onLogout }) => {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [drawerAnimation] = useState(new Animated.Value(0));

  const menuItems = [
    { name: 'Dashboard', icon: 'view-dashboard', screen: 'Dashboard', hint: 'Realtime overview' },
    { name: 'User', icon: 'account-group', screen: 'User', hint: 'Manage accounts' },
    { name: 'Category', icon: 'shape-outline', screen: 'Category', hint: 'Manage categories' },
    { name: 'Order', icon: 'cart', screen: 'Order', hint: 'Track purchases' },
    { name: 'Supplier', icon: 'truck-delivery', screen: 'Supplier', hint: 'Vendor records' },
    { name: 'Reviews', icon: 'star', screen: 'Reviews', hint: 'Ratings and feedback' },
    { name: 'Product', icon: 'package-variant', screen: 'Product', hint: 'Inventory controls' },
  ];

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    Animated.spring(drawerAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleMenuItemPress = (itemName) => {
    setSelectedItem(itemName);
    console.log(`Navigating to ${itemName}`);
    
    switch(itemName) {
      case 'User':
        navigation.navigate('UserList');
        break;
      case 'Category':
        navigation.navigate('CategoryList');
        break;
      case 'Supplier':
        navigation.navigate('SupplierList');
        break;
      case 'Product':
        navigation.navigate('ProductList');
        break;
      case 'Dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'Order':
        navigation.navigate('OrderList');
        break;
      case 'Reviews':
        navigation.navigate('ReviewList');
        break;
      default:
        break;
    }
    
    toggleDrawer();
  };

  const translateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const overlayOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={styles.container}>
      {/* Header with Hamburger Menu */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={toggleDrawer} 
          style={styles.hamburgerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="menu" size={30} color={THEME.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content - Add collapsable={false} to prevent re-rendering */}
      <View style={styles.content} collapsable={false}>
        {children}
      </View>

      {/* Overlay - Use conditional rendering instead of display style */}
      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <Animated.View 
            style={[
              styles.overlay,
              { opacity: overlayOpacity }
            ]} 
          />
        </TouchableWithoutFeedback>
      )}

      {/* Drawer - Use conditional rendering */}
      {isDrawerOpen && (
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Icon name="chip" size={40} color={THEME.accent} />
            <Text style={styles.drawerHeaderText}>TechNest</Text>
            <Text style={styles.drawerSubHeaderText}>Control Console</Text>
          </View>

          <ScrollView style={styles.drawerContent}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.drawerItem,
                  selectedItem === item.name && styles.drawerItemSelected,
                ]}
                onPress={() => handleMenuItemPress(item.name)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.menuIconWrap,
                  selectedItem === item.name && styles.menuIconWrapSelected,
                ]}>
                  <Icon
                    name={item.icon}
                    size={22}
                    color={selectedItem === item.name ? THEME.accent : THEME.textMuted}
                  />
                </View>

                <View style={styles.menuTextWrap}>
                  <Text
                    style={[
                      styles.drawerItemText,
                      selectedItem === item.name && styles.drawerItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.drawerItemHint,
                      selectedItem === item.name && styles.drawerItemHintSelected,
                    ]}
                  >
                    {item.hint}
                  </Text>
                </View>

                <Icon
                  name="chevron-right"
                  size={18}
                  color={selectedItem === item.name ? THEME.accent : THEME.textMuted}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <TouchableOpacity 
              style={[styles.drawerFooterItem, styles.settingsAction]}
              activeOpacity={0.7}
            >
              <View style={styles.footerIconWrap}>
                <Icon name="cog" size={20} color={THEME.accent} />
              </View>
              <View style={styles.footerTextWrap}>
                <Text style={styles.drawerFooterText}>Settings</Text>
                <Text style={styles.drawerFooterMeta}>System preferences</Text>
              </View>
              <Icon name="chevron-right" size={18} color={THEME.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.drawerFooterItem, styles.logoutAction]}
              onPress={onLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.footerIconWrap, styles.logoutIconWrap]}>
                <Icon name="logout" size={20} color={THEME.danger} />
              </View>
              <View style={styles.footerTextWrap}>
                <Text style={[styles.drawerFooterText, styles.logoutText]}>Logout</Text>
                <Text style={[styles.drawerFooterMeta, styles.logoutMeta]}>End admin session</Text>
              </View>
              <Icon name="chevron-right" size={18} color={THEME.danger} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    elevation: 3,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 10,
  },
  hamburgerButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    letterSpacing: 0.4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#020617',
    zIndex: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: THEME.card,
    elevation: 8,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    zIndex: 30,
  },
  drawerHeader: {
    padding: 22,
    paddingTop: 50,
    backgroundColor: '#EEF6FF',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    alignItems: 'center',
  },
  drawerHeaderText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginTop: 10,
  },
  drawerSubHeaderText: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 5,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 14,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 13,
    marginHorizontal: 10,
    borderRadius: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#1D2B45',
    backgroundColor: '#F6FAFF',
  },
  drawerItemSelected: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: THEME.accent,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F2FF',
    borderWidth: 1,
    borderColor: '#BFD9F1',
    marginRight: 13,
  },
  menuIconWrapSelected: {
    backgroundColor: '#D7EEFF',
    borderColor: THEME.accent,
  },
  menuTextWrap: {
    flex: 1,
  },
  drawerItemText: {
    fontSize: 15,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  drawerItemTextSelected: {
    color: THEME.accent,
    fontWeight: '700',
  },
  drawerItemHint: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  drawerItemHintSelected: {
    color: '#BFE9FF',
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    padding: 15,
    gap: 11,
  },
  drawerFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 13,
    borderWidth: 1,
  },
  settingsAction: {
    backgroundColor: '#EAF6FF',
    borderColor: '#BAE6FD',
  },
  logoutAction: {
    backgroundColor: '#FEEFF2',
    borderColor: '#FCA5A5',
  },
  footerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#DCEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutIconWrap: {
    backgroundColor: '#FBD5DD',
  },
  footerTextWrap: {
    flex: 1,
  },
  drawerFooterText: {
    fontSize: 15,
    color: THEME.textPrimary,
    fontWeight: '600',
  },
  drawerFooterMeta: {
    marginTop: 2,
    fontSize: 12,
    color: THEME.textMuted,
  },
  logoutText: {
    color: '#DC2626',
  },
  logoutMeta: {
    color: '#B91C1C',
  },
});

export default AdminDrawer;
