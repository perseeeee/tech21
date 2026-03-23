import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import axios from 'axios';
import { authenticate } from '../../utils/helper';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { registerForPushNotificationsAsync } from '../../hooks/usePushNotifications';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please enter email and password');
    return;
  }

  setLoading(true);
  try {
    const apiUrl = `${BACKEND_URL}/api/v1/users/login`;
    console.log('Calling API:', apiUrl);
    
    const res = await axios.post(apiUrl, { email, password });
    
    console.log('✅ Login successful:', res.data);
    
    // Save token and user info
    await authenticate(res.data, async () => {
      Alert.alert('Success', 'Login successful');
      
      // Register for push notifications after successful login
      // Add a small delay to ensure authentication is complete
    setTimeout(async () => {
      console.log('Attempting to register push token after login...');
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        console.log('✅ Push token registered successfully:', token);
      } else {
        console.log('⚠️ Push token registration returned null');
      }
    }, 1000);
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    Alert.alert('Login Failed', error.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.gridBackground} />
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.content}>
        {/* Logo or App Name */}
        <View style={styles.logoContainer}>
          <View style={styles.iconBox}>
            <Image
              source={require('../layouts/techlogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, fontsLoaded && { fontFamily: 'PressStart2P_400Regular' }]}>TECHNEST</Text>
          <Text style={styles.tagline}>Where Smart Gadgets Meet Smart Living</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome To TechNest</Text>
          <Text style={styles.subtitle}>Sign in to your gadget hub</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#38BDF8" style={styles.inputIcon} />
            <TextInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#E2E8F0"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#38BDF8" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, { flex: 1 }]}
              placeholderTextColor="#E2E8F0"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={20} 
                color="#38BDF8" 
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.loginButtonText}>Power In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>By signing in, you agree to our</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> and </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    opacity: 0.96,
  },
  glowOrbTop: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#38BDF8',
    opacity: 0.12,
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: -120,
    left: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#38BDF8',
    opacity: 0.1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconBox: {
    width: 140,
    height: 140,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 6,
    letterSpacing: 0.7,
  },
  formContainer: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    padding: 20,
    borderRadius: 18,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: '#0F172A',
    borderRadius: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#FFFFFF',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#38BDF8',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 12,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  loginButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signUpText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  signUpLink: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 4,
  },
  footerLink: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '500',
  },
});
