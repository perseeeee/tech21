// C&V PetShop/frontend/src/Components/AdminScreen/usermanagement/TrashUser.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
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

const TrashUserScreen = ({ navigation }) => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeletedUsers = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/api/v1/users/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching deleted users:', error);
      Alert.alert('Error', 'Failed to load deleted users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeletedUsers();
  };

  const handleRestoreUser = async (userId, userName) => {
    Alert.alert(
      'Restore User',
      `Are you sure you want to restore "${userName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'default',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.patch(
                `${BACKEND_URL}/api/v1/users/restore/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              setDeletedUsers(prev => prev.filter(user => user._id !== userId));
              
              Alert.alert('Success', 'User restored successfully', [
                {
                  text: 'OK',
                },
              ]);
            } catch (error) {
              console.error('Error restoring user:', error);
              Alert.alert('Error', 'Failed to restore user');
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = async (userId, userName) => {
    Alert.alert(
      'Permanent Delete',
      `Are you sure you want to PERMANENTLY delete "${userName}"?\n\nThis action cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(
                `${BACKEND_URL}/api/v1/users/delete/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              setDeletedUsers(prev => prev.filter(user => user._id !== userId));
              
              Alert.alert('Success', 'User permanently deleted');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user permanently');
            }
          },
        },
      ]
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

  const renderRightActions = (user) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeButton, styles.restoreButton]}
        onPress={() => handleRestoreUser(user._id, user.name)}
      >
        <Icon name="restore" size={20} color="#fff" />
        <Text style={styles.swipeButtonText}>Restore</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeButton, styles.deleteButton]}
        onPress={() => handlePermanentDelete(user._id, user.name)}
      >
        <Icon name="delete-forever" size={20} color="#fff" />
        <Text style={styles.swipeButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{item.name}</Text>
              {item.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            
            <View style={styles.deletedInfoContainer}>
              <Icon name="delete" size={14} color={THEME.danger} />
              <Text style={styles.deletedText}>
                Deleted on: {formatDate(item.deletedAt || item.updatedAt)}
              </Text>
            </View>
            
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.isActive ? THEME.success : THEME.danger },
                ]}
              />
              <Text style={styles.statusText}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: THEME.warning }]} />
              <Text style={styles.statusText}>
                {item.isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
          
          <View style={styles.deletedBadge}>
            <Icon name="delete" size={16} color="#fff" />
            <Text style={styles.deletedBadgeText}>Deleted</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const TrashUserContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={28}
          color={THEME.accent}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Trash / Deleted Users</Text>
      </View>

      <View style={styles.infoContainer}>
        <Icon name="info" size={20} color={THEME.accent} />
        <Text style={styles.infoText}>
          Swipe left on a user to restore or permanently delete.
        </Text>
      </View>

      <FlatList
        data={deletedUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="delete-sweep" size={60} color={THEME.textMuted} />
            <Text style={styles.emptyTitle}>No Deleted Users</Text>
            <Text style={styles.emptySubtitle}>
              Users that are soft-deleted will appear here
            </Text>
          </View>
        }
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.accent} />
      </View>
    );
  }

  return (
    <AdminDrawer onLogout={handleLogout}>
      <TrashUserContent />
    </AdminDrawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6FF',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: THEME.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  adminBadge: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: THEME.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  adminText: {
    color: '#075985',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  deletedInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deletedText: {
    fontSize: 12,
    color: '#B91C1C',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginRight: 12,
  },
  deletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deletedBadgeText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  swipeButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    marginLeft: 8,
  },
  restoreButton: {
    backgroundColor: '#16A34A',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  swipeButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TrashUserScreen;
