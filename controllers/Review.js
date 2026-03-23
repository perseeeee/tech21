const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");

const findEligibleDeliveredOrder = async (userId, productId, orderId) => {
  const query = {
    user: userId,
    orderStatus: "Delivered",
    "orderItems.product": productId,
  };

  if (orderId) {
    query._id = orderId;
  }

  return Order.findOne(query).select("_id orderStatus");
};

// Create a review (only if the user hasn't reviewed yet and order is delivered)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, productId, orderId } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (!rating || !comment || !productId) {
      return res.status(400).json({ success: false, message: "Please provide rating, comment, and productId." });
    }

    const deliveredOrder = await findEligibleDeliveredOrder(userId, productId, orderId);
    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: "You can only review products from your delivered orders.",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product. Please update your review instead." });
    }

    // Create new review
    const review = await Review.create({
      user: userId,
      product: productId,
      name: userName,
      rating,
      comment,
    });

    // Update product ratings and review count
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const allReviews = await Review.find({ product: productId, isActive: true });
    product.numOfReviews = allReviews.length;
    product.ratings = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;

    await product.save();

    res.status(201).json({ success: true, message: "Review created successfully.", review });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update an existing review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, productId, orderId } = req.body;
    const userId = req.user._id;

    if (!rating || !comment || !productId) {
      return res.status(400).json({ success: false, message: "Please provide rating, comment, and productId." });
    }

    const deliveredOrder = await findEligibleDeliveredOrder(userId, productId, orderId);
    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: "You can only review products from your delivered orders.",
      });
    }

    const review = await Review.findOne({
      user: userId,
      product: productId
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found. Please create a review first." });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update product average rating
    const product = await Product.findById(productId);
    if (product) {
      const allReviews = await Review.find({ product: productId, isActive: true });
      product.ratings = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
      await product.save();
    }

    res.status(200).json({ success: true, message: "Review updated successfully.", review });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Check if user is allowed to review a product (must have a delivered order containing it)
exports.getReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    const deliveredOrder = await findEligibleDeliveredOrder(userId, productId);

    res.status(200).json({
      success: true,
      canReview: !!deliveredOrder,
      orderId: deliveredOrder?._id || null,
      message: deliveredOrder
        ? "Eligible to review"
        : "You can only review products from your delivered orders.",
    });
  } catch (error) {
    console.error("Review eligibility error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.query;
    const reviews = await Review.find({ product: productId, isActive: true })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's review for a specific product
exports.getUserProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({
      user: userId,
      product: productId
    });

    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error("Get user product review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};