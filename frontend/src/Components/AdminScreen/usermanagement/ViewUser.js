// C&V PetShop/frontend/src/Components/AdminScreen/usermanagement/ViewUser.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
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

const ViewUserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/api/v1/users/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details');
      navigation.goBack();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const ViewUserContent = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={28}
          color={THEME.accent}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>User Details</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role:</Text>
            <View style={[styles.roleBadge, user.role === 'admin' ? styles.adminBadge : styles.userBadge]}>
              <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicatorContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: user.isActive ? THEME.success : THEME.danger },
                  ]}
                />
                <Text style={styles.statusLabel}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicatorContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: user.isVerified ? THEME.success : THEME.warning },
                  ]}
                />
                <Text style={styles.statusLabel}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicatorContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: user.isDeleted ? THEME.danger : THEME.success },
                  ]}
                />
                <Text style={styles.statusLabel}>
                  {user.isDeleted ? 'Deleted' : 'Not Deleted'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timestamps</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{formatDate(user.createdAt)}</Text>
          </View>
          {user.updatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Updated:</Text>
              <Text style={styles.value}>{formatDate(user.updatedAt)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('UpdateUser', { userId: user._id })}
        >
          <Icon name="edit" size={20} color={THEME.accent} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              'Delete User',
              'Are you sure you want to soft delete this user?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const token = await getToken();
                      await axios.delete(`${BACKEND_URL}/api/v1/users/${user._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      Alert.alert('Success', 'User soft deleted');
                      navigation.goBack();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete user');
                    }
                  },
                },
              ]
            );
          }}
        >
          <Icon name="delete" size={20} color={THEME.danger} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.accent} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminDrawer onLogout={handleLogout}>
      <ViewUserContent />
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
  card: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 16,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: THEME.textPrimary,
    fontWeight: '400',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#103357',
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  userBadge: {
    backgroundColor: '#13233F',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statusItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicatorContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: THEME.card,
    marginHorizontal: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: THEME.cardSoft,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#f44336',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ViewUserScreen;
