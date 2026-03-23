import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AdminDrawer from '../AdminDrawer';
import { getToken, logout } from '../../../utils/helper';

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
};

export default function TrashCategoryScreen({ navigation }) {
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeletedCategories = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${BACKEND_URL}/api/v1/admin/categories/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching deleted categories:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load deleted categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDeletedCategories();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchDeletedCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeletedCategories();
  };

  const handleRestore = async (category) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${BACKEND_URL}/api/v1/admin/categories/restore/${category._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Category restored successfully');
      fetchDeletedCategories();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to restore category';
      Alert.alert('Error', message);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => logout() },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <View style={styles.nameWrap}>
        <View style={styles.itemTitleRow}>
          <View style={styles.deletedIconWrap}>
            <Icon name="delete-outline" size={14} color={THEME.danger} />
          </View>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
        <Text style={styles.itemMeta}>Soft deleted category</Text>
      </View>
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={() => handleRestore(item)}
        activeOpacity={0.8}
      >
        <Icon name="restore" size={18} color={THEME.success} />
        <Text style={styles.restoreText}>Restore</Text>
      </TouchableOpacity>
    </View>
  );

  const TrashContent = () => (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.countBadge}>{deletedCategories.length}</Text>
        </View>
        <Text style={styles.headerTitle}>Category Trash</Text>
        <Text style={styles.headerSubTitle}>All soft-deleted categories appear here for recovery.</Text>
      </View>

      <FlatList
        data={deletedCategories}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="delete-sweep" size={70} color={THEME.textMuted} />
            <Text style={styles.emptyTitle}>No Deleted Categories</Text>
            <Text style={styles.emptySubtitle}>Trash is empty. All categories are active.</Text>
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
      <TrashContent />
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
  header: {
    backgroundColor: THEME.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerCard: {
    backgroundColor: THEME.card,
    margin: 12,
    marginBottom: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FCFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginTop: 8,
  },
  headerSubTitle: {
    marginTop: 2,
    fontSize: 13,
    color: THEME.textMuted,
  },
  countBadge: {
    minWidth: 30,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    textAlign: 'center',
    color: 'white',
    fontWeight: '700',
    backgroundColor: THEME.danger,
  },
  listContent: {
    padding: 12,
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: THEME.card,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  nameWrap: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEEFF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  itemMeta: {
    marginTop: 2,
    fontSize: 12,
    color: THEME.textMuted,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 10,
  },
  restoreText: {
    marginLeft: 4,
    color: THEME.success,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    marginTop: 10,
    color: THEME.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    marginTop: 4,
    color: THEME.textMuted,
    fontSize: 13,
  },
});
