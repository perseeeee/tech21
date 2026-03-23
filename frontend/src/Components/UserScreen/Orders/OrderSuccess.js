// CVPetShop/frontend/src/Components/UserScreen/Orders/OrderSuccess.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import UserDrawer from '../UserDrawer';  // Changed: went up 1 level then to UserDrawer
import Header from '../../layouts/Header';  // Changed: went up 2 levels then to layouts/Header

export default function OrderSuccess({ route, navigation }) {
  const { order, orderId, orderNumber } = route.params || {};

  return (
    <UserDrawer>
      <SafeAreaView style={styles.safeArea}>
        <Header />
        
        <View style={styles.container}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={100} color="#4CAF50" />
          </View>
          
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.subtitle}>
            Thank you for your purchase. Your order has been received.
          </Text>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoText}>
              Order ID: {orderId || order?._id || 'N/A'}
            </Text>
            {orderNumber && (
              <Text style={styles.orderInfoText}>
                Order Number: {orderNumber}
              </Text>
            )}
            <Text style={styles.orderInfoText}>
              Total: ₱{order?.totalPrice?.toFixed(2) || '0.00'}
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.85}
            >
              <Icon name="home" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('OrderHistory')}
              activeOpacity={0.85}
            >
              <Icon name="history" size={20} color="#0EA5E9" />
              <Text style={styles.secondaryButtonText}>View Order History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </UserDrawer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F8FC',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  orderInfo: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderInfoText: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0C4A6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F7FBFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  secondaryButtonText: {
    color: '#0EA5E9',
    fontSize: 16,
    fontWeight: '600',
  },
});
