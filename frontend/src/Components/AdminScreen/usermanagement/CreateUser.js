// C&V PetShop/frontend/src/Components/AdminScreen/usermanagement/CreateUser.js
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
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
};

const CreateUserContent = React.memo(({
  formData,
  updateField,
  loading,
  errors,
  handleSubmit,
  navigation,
  nameInputRef,
  emailInputRef,
  passwordInputRef,
  confirmPasswordInputRef
}) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={28} color={THEME.accent} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New User</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              ref={nameInputRef}
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter full name"
              placeholderTextColor={THEME.textMuted}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              ref={emailInputRef}
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="Enter email address"
              placeholderTextColor={THEME.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.label}>Password *</Text>
            <TextInput
              ref={passwordInputRef}
              style={[styles.input, errors.password && styles.inputError]}
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder="Enter password (min. 6 characters)"
              placeholderTextColor={THEME.textMuted}
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              ref={confirmPasswordInputRef}
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              placeholder="Confirm password"
              placeholderTextColor={THEME.textMuted}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!loading}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Select Role</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'user' && styles.roleButtonActive,
                  ]}
                  onPress={() => updateField('role', 'user')}
                  disabled={loading}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'user' && styles.roleButtonTextActive,
                  ]}>
                    User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'admin' && styles.roleButtonActive,
                  ]}
                  onPress={() => updateField('role', 'admin')}
                  disabled={loading}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'admin' && styles.roleButtonTextActive,
                  ]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Icon name="info" size={20} color={THEME.accent} />
              <Text style={styles.infoText}>
                New users will be automatically verified upon creation.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create User</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

const CreateUserScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await getToken();
      await axios.post(
        `${BACKEND_URL}/api/v1/users`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert(
        'Success',
        'User created successfully and automatically verified!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.status === 400) {
        Alert.alert('Error', error.response.data.message || 'Email already exists');
      } else {
        Alert.alert('Error', 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, navigation]);

  const handleLogout = useCallback(async () => {
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
  }, []);

  const contentProps = useMemo(() => ({
    formData,
    updateField,
    loading,
    errors,
    handleSubmit,
    navigation,
    nameInputRef,
    emailInputRef,
    passwordInputRef,
    confirmPasswordInputRef
  }), [formData, updateField, loading, errors, handleSubmit, navigation]);

  return (
    <AdminDrawer onLogout={handleLogout}>
      <CreateUserContent {...contentProps} />
    </AdminDrawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  formContainer: {
    padding: 20,
    backgroundColor: THEME.card,
    margin: 16,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: THEME.textSecondary,
  },
  input: {
    backgroundColor: THEME.cardSoft,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    fontSize: 16,
    color: THEME.textPrimary,
  },
  inputError: {
    borderColor: THEME.danger,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    marginBottom: 10,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    borderWidth: 1,
    borderColor: THEME.accent,
    borderRadius: 8,
    paddingVertical: 12,
    width: '48%',
    alignItems: 'center',
    backgroundColor: THEME.cardSoft,
  },
  roleButtonActive: {
    backgroundColor: THEME.accent,
  },
  roleButtonText: {
    color: THEME.accent,
    fontWeight: '500',
    fontSize: 16,
  },
  roleButtonTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: THEME.textSecondary,
  },
  submitButton: {
    backgroundColor: THEME.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateUserScreen;
