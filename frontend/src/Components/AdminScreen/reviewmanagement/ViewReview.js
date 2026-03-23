// CVPetShop/frontend/src/Components/AdminScreen/reviewmanagement/ViewReview.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { getToken } from '../../../utils/helper';
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

export default function ViewReview({ route, navigation }) {
  const { reviewId } = route.params;
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviewDetails();
  }, [reviewId]);

  const fetchReviewDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      // Get review details - matches your route: /api/v1/admin/reviews/:reviewId
      const response = await axios.get(`${BACKEND_URL}/api/v1/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReview(response.data.review);
      } else {
        setError('Failed to load review details');
      }
    } catch (error) {
      console.error('Error fetching review details:', error);
      setError(error.response?.data?.message || 'Failed to load review details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Review',
      `Are you sure you want to permanently delete this review by ${review?.user}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              // Using the correct permanent delete endpoint: /api/v1/admin/reviews/delete/:reviewId
              await axios.delete(`${BACKEND_URL}/api/v1/admin/reviews/delete/${review._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Success', 'Review deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete review');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={24}
          color={i <= rating ? '#F59E0B' : '#CBD5E1'}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  if (loading) {
    return (
      <AdminDrawer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={THEME.accent} />
          <Text style={styles.loadingText}>Loading review details...</Text>
        </View>
      </AdminDrawer>
    );
  }

  if (error || !review) {
    return (
      <AdminDrawer>
        <View style={styles.centered}>
          <Icon name="error-outline" size={80} color={THEME.textMuted} />
          <Text style={styles.errorTitle}>Review Not Found</Text>
          <Text style={styles.errorText}>
            {error || "The review you're looking for doesn't exist or has been removed."}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AdminDrawer>
    );
  }

  return (
    <AdminDrawer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Icon name="arrow-back" size={24} color={THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Product Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Information</Text>
            <View style={styles.productCard}>
              <View style={styles.productInfo}>
                <Icon name="shopping-bag" size={24} color={THEME.accent} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{review.productName || 'Unknown Product'}</Text>
                  <Text style={styles.productId}>Product ID: {review.productId || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* User Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviewer Information</Text>
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {review.user ? review.user.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{review.user || 'Anonymous'}</Text>
                <Text style={styles.userEmail}>{review.userEmail || 'No email provided'}</Text>
                {review.userId && (
                  <Text style={styles.userId}>User ID: {review.userId}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Review Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review Details</Text>
            
            <View style={styles.reviewCard}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                {renderStars(review.rating)}
                <Text style={styles.ratingValue}>{review.rating}.0 / 5.0</Text>
              </View>

              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel}>Comment:</Text>
                <Text style={styles.commentText}>{review.comment || 'No comment provided'}</Text>
              </View>

              <View style={styles.datesContainer}>
                <View style={styles.dateRow}>
                  <Icon name="event" size={16} color={THEME.textMuted} />
                  <Text style={styles.dateLabel}>Created:</Text>
                  <Text style={styles.dateValue}>{formatDate(review.createdAt)}</Text>
                </View>
                
                {review.updatedAt && review.updatedAt !== review.createdAt && (
                  <View style={styles.dateRow}>
                    <Icon name="update" size={16} color={THEME.textMuted} />
                    <Text style={styles.dateLabel}>Updated:</Text>
                    <Text style={styles.dateValue}>{formatDate(review.updatedAt)}</Text>
                  </View>
                )}
              </View>

              {/* Status Badge - shows if active or not */}
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={[styles.statusBadge, review.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={[styles.statusText, review.isActive ? styles.activeText : styles.inactiveText]}>
                    {review.isActive ? 'Active' : 'Deleted'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Icon name="delete" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Delete Review</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
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
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 15,
    color: THEME.textMuted,
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME.accent,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: THEME.card,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: THEME.cardSoft,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetails: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  productId: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: THEME.cardSoft,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  reviewCard: {
    backgroundColor: THEME.cardSoft,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  commentContainer: {
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  commentText: {
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 22,
    backgroundColor: THEME.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  datesContainer: {
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: THEME.textMuted,
    marginLeft: 6,
    marginRight: 4,
    fontWeight: '500',
  },
  dateValue: {
    flex: 1,
    fontSize: 13,
    color: THEME.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#B91C1C',
  },
  actionButtons: {
    backgroundColor: THEME.card,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.danger,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
