// C&V PetShop/frontend/src/Components/AdminScreen/usermanagement/UpdateUser.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
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
};

const UpdateUserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/api/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setSelectedRole(response.data.user.role);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      Alert.alert('No Changes', 'Role is already set to this value');
      return;
    }

    setUpdating(true);
    try {
      const token = await getToken();
      await axios.patch(
        `${BACKEND_URL}/api/v1/users/role/${userId}`,
        { role: selectedRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert(
        'Success',
        `User role updated to ${selectedRole}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    } finally {
      setUpdating(false);
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

  const UpdateUserContent = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon
          name="arrow-back"
          size={28}
          color={THEME.accent}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Update User Role</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.currentRoleContainer}>
            <Text style={styles.currentRoleLabel}>Current Role:</Text>
            <View style={[styles.roleBadge, user.role === 'admin' ? styles.adminBadge : styles.userBadge]}>
              <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.roleSelectorContainer}>
        <Text style={styles.selectorTitle}>Select New Role</Text>
        
        <View style={styles.roleOptions}>
          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === 'user' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('user')}
          >
            <Icon
              name="person"
              size={20}
              color={selectedRole === 'user' ? '#0F172A' : THEME.accent}
            />
            <Text style={[
              styles.roleOptionText,
              selectedRole === 'user' && styles.roleOptionTextActive,
            ]}>
              User
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === 'admin' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('admin')}
          >
            <Icon
              name="admin-panel-settings"
              size={20}
              color={selectedRole === 'admin' ? '#0F172A' : THEME.accent}
            />
            <Text style={[
              styles.roleOptionText,
              selectedRole === 'admin' && styles.roleOptionTextActive,
            ]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roleDescription}>
          {selectedRole === 'user' ? (
            <>
              <Icon name="info" size={20} color={THEME.success} />
              <Text style={styles.descriptionText}>
                User role has limited access to basic features.
              </Text>
            </>
          ) : (
            <>
              <Icon name="warning" size={20} color={THEME.danger} />
              <Text style={styles.descriptionText}>
                Admin role has full access to all management features.
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateRole}
          disabled={updating || selectedRole === user.role}
        >
          {updating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.updateButtonText}>Update Role</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.warningContainer}>
        <Icon name="warning" size={24} color="#F59E0B" />
        <Text style={styles.warningText}>
          Note: You can only change the user's role. Other details must be updated by the user themselves.
        </Text>
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
      <UpdateUserContent />
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
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 16,
  },
  currentRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentRoleLabel: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleSelectorContainer: {
    backgroundColor: THEME.card,
    margin: 16,
    padding: 20,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 20,
  },
  roleOptions: {
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.accent,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  roleOptionActive: {
    backgroundColor: THEME.accent,
  },
  roleOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: THEME.accent,
    fontWeight: '500',
  },
  roleOptionTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  roleDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardSoft,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  descriptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: THEME.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#334155',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: THEME.accent,
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B1D10',
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#FCD34D',
  },
});

export default UpdateUserScreen;
