// CVPetShop/frontend/src/Components/AdminScreen/suppliermanagement/ViewSupplier.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
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
  success: '#16A34A',
  warning: '#D97706',
};

export default function ViewSupplierScreen({ navigation, route }) {
  const { supplierId } = route.params;
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchSupplierDetails();
  }, [supplierId]);

  const fetchSupplierDetails = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/suppliers/${supplierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSupplier(res.data.supplier);
      setProducts(res.data.supplier.products || []);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      Alert.alert('Error', 'Failed to load supplier details');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.accent} />
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.centered}>
        <Text>Supplier not found</Text>
      </View>
    );
  }

  // Main content of ViewSupplier screen
  const ViewSupplierContent = () => (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{supplier.name}</Text>
        
        <View style={styles.infoRow}>
          <Icon name="email" size={20} color={THEME.textMuted} />
          <Text style={styles.infoText}>{supplier.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color={THEME.textMuted} />
          <Text style={styles.infoText}>{supplier.phone}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.text}>{supplier.address?.street}</Text>
          <Text style={styles.text}>{supplier.address?.city}, {supplier.address?.state}</Text>
          <Text style={styles.text}>{supplier.address?.country} - {supplier.address?.zipCode}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Associated Products ({products.length})</Text>
        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products associated</Text>
        ) : (
          products.map((product) => (
            <View key={product._id} style={styles.productItem}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productStock}>Stock: {product.stock}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('UpdateSupplier', { supplier })}
        >
          <Icon name="edit" size={20} color="white" />
          <Text style={styles.buttonText}>Edit Supplier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="white" />
          <Text style={styles.buttonText}>Back to List</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <AdminDrawer onLogout={handleLogout}>
      <ViewSupplierContent />
    </AdminDrawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: THEME.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: THEME.textSecondary,
  },
  section: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: THEME.textPrimary,
  },
  text: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 5,
  },
  productItem: {
    backgroundColor: THEME.cardSoft,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  productPrice: {
    fontSize: 14,
    color: THEME.success,
    marginTop: 2,
  },
  productCategory: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  productStock: {
    fontSize: 12,
    color: THEME.warning,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  backButton: {
    backgroundColor: '#94A3B8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});
