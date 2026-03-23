const express = require("express");
const {
  createReview,
  updateReview,
  getProductReviews,
  getUserProductReview,
  getReviewEligibility,
} = require("../controllers/Review");
const { isAuthenticatedUser } = require("../middlewares/auth");

const router = express.Router();

// Create a new review
router.post("/review/create", isAuthenticatedUser, createReview);

// Update an existing review
router.put("/review/update", isAuthenticatedUser, updateReview);

// Get all reviews for a product
router.get("/reviews", getProductReviews);

// Get user's review for a specific product
router.get("/review/user/:productId", isAuthenticatedUser, getUserProductReview);

// Check if current user can review a product
router.get("/review/eligibility/:productId", isAuthenticatedUser, getReviewEligibility);

module.exports = router;