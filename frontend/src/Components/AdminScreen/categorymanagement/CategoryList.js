import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AdminDrawer from '../AdminDrawer';
import { getToken, logout } from '../../../utils/helper';

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

export default function CategoryListScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [updatingCategoryId, setUpdatingCategoryId] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/categories`);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) {
      Alert.alert('Validation', 'Please enter a category name');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      await axios.post(
        `${BACKEND_URL}/api/v1/admin/categories`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewCategory('');
      await fetchCategories();
      Alert.alert('Success', 'Category added successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add category';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    Alert.alert(
      'Delete Category',
      `Delete ${category.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${BACKEND_URL}/api/v1/admin/categories/${category._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              await fetchCategories();
            } catch (error) {
              const message = error.response?.data?.message || 'Failed to delete category';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setEditingName(category.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingName('');
  };

  const handleUpdateCategory = async (category) => {
    const name = editingName.trim();
    if (!name) {
      Alert.alert('Validation', 'Please enter a category name');
      return;
    }

    setUpdatingCategoryId(category._id);
    try {
      const token = await getToken();
      await axios.put(
        `${BACKEND_URL}/api/v1/admin/categories/${category._id}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      cancelEditCategory();
      await fetchCategories();
      Alert.alert('Success', 'Category updated successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update category';
      Alert.alert('Error', message);
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => logout() },
    ]);
  };

  const handleGoToTrash = () => {
    navigation.navigate('TrashCategory');
  };

  return (
    <AdminDrawer onLogout={handleLogout}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.title}>Category Management</Text>
              <Text style={styles.subtitle}>Add and manage product categories</Text>
            </View>
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{categories.length}</Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>New Category</Text>
            <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="New category name"
              placeholderTextColor={THEME.textMuted}
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TouchableOpacity
              style={[styles.addButton, submitting && styles.buttonDisabled]}
              onPress={handleAddCategory}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Icon name="plus" size={22} color="white" />
              )}
            </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={THEME.accent} />
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>No categories found.</Text>}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  {editingCategoryId === item._id ? (
                    <>
                      <TextInput
                        style={styles.editInput}
                        value={editingName}
                        onChangeText={setEditingName}
                        placeholder="Category name"
                        placeholderTextColor={THEME.textMuted}
                      />
                      <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={() => handleUpdateCategory(item)}
                        activeOpacity={0.8}
                        disabled={updatingCategoryId === item._id}
                      >
                        {updatingCategoryId === item._id ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Icon name="content-save-outline" size={18} color="white" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={cancelEditCategory}
                        activeOpacity={0.8}
                        disabled={updatingCategoryId === item._id}
                      >
                        <Icon name="close" size={18} color={THEME.textMuted} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.nameWrap}>
                        <View style={styles.itemHeadRow}>
                          <View style={styles.itemIconWrap}>
                            <Icon name="shape-outline" size={16} color={THEME.accent} />
                          </View>
                          <Text style={styles.itemName}>{item.name}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => startEditCategory(item)}
                        activeOpacity={0.8}
                      >
                        <Icon name="pencil-outline" size={18} color={THEME.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteCategory(item)}
                        activeOpacity={0.8}
                      >
                        <Icon name="delete-outline" size={18} color={THEME.danger} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            />
          )}

          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={[styles.fab, styles.trashButton]}
              onPress={handleGoToTrash}
              activeOpacity={0.85}
            >
              <Icon name="delete" size={22} color="white" />
              <View style={styles.fabLabel}>
                <Text style={styles.fabLabelText}>Trash</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AdminDrawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 18,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: THEME.textMuted,
    fontSize: 13,
  },
  countChip: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  countChipText: {
    color: THEME.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  inputCard: {
    backgroundColor: '#F8FCFF',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  inputLabel: {
    color: THEME.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.textPrimary,
    backgroundColor: THEME.cardSoft,
  },
  addButton: {
    width: 46,
    borderRadius: 10,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 92,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#F8FCFF',
  },
  nameWrap: {
    flex: 1,
  },
  itemHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#EAF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    color: THEME.textPrimary,
    backgroundColor: THEME.card,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#EAF6FF',
    borderColor: '#BAE6FD',
  },
  saveButton: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderColor: THEME.border,
  },
  deleteButton: {
    backgroundColor: '#FEEFF2',
    borderColor: '#FECACA',
  },
  fabContainer: {
    position: 'absolute',
    right: 18,
    bottom: 18,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  trashButton: {
    backgroundColor: THEME.danger,
  },
  fabLabel: {
    position: 'absolute',
    right: 64,
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  fabLabelText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: THEME.textMuted,
    marginTop: 24,
  },
});
