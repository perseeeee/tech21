// backend/controllers/ManageOrderController.js
const Order = require("../models/Order");
const sendEmail = require("../utils/Mailer");
const { generateOrderEmailTemplate } = require("../utils/emailTemplate");
const { generateReceiptPDF } = require("../utils/pdfGenerator");
const { sendPushNotification } = require("../utils/pushNotification");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order details." });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Processing",
      "Accepted",
      "Cancelled",
      "Out for Delivery",
      "Delivered",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: Processing, Accepted, Cancelled, Out for Delivery, Delivered.",
      });
    }

    const order = await Order.findById(id)
      .populate({
        path: "user",
        select: "name email pushToken",
      })
      .populate("orderItems.product", "name");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    console.log("Order update - User data:", {
      userId: order.user?._id,
      name: order.user?.name,
      email: order.user?.email,
      hasPushToken: !!order.user?.pushToken,
    });

    const oldStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });

    // Run notifications after the response so the admin screen doesn't stay stuck on loading.
    setImmediate(async () => {
      if (order.user && order.user.pushToken) {
        try {
          console.log(`Attempting to send push notification for order #${order._id}`);

          let notificationBody = `Your order #${order._id.toString().slice(-8)} status changed to ${status}`;

          const notificationData = {
            type: "ORDER_STATUS_UPDATE",
            orderId: order._id.toString(),
            orderNumber: order._id.toString().slice(-8),
            status,
            oldStatus,
            timestamp: new Date().toISOString(),
            user: {
              id: order.user._id.toString(),
              name: order.user.name,
              email: order.user.email,
            },
            orderSummary: {
              totalAmount: order.totalPrice,
              itemCount: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
              items: order.orderItems.map(item => ({
                productName: item.product?.name || "Product",
                quantity: item.quantity,
                price: item.price,
              })),
            },
          };

          if (status === "Delivered") {
            notificationBody = `Your order #${order._id.toString().slice(-8)} has been delivered! Check your email for receipt.`;
          }

          const pushResult = await sendPushNotification(
            order.user.pushToken,
            `Order ${status}`,
            notificationBody,
            notificationData
          );

          console.log(`Push notification sent successfully for order #${order._id}`);
          console.log("Push result:", pushResult);
        } catch (pushError) {
          console.error("Failed to send push notification:", pushError);
          console.error("Push error details:", pushError.stack);
        }
      } else {
        console.log(`No push token found for user: ${order.user?.email || "unknown"}`);
      }

      try {
        const emailTemplate = generateOrderEmailTemplate(order, order.user, status);
        const emailOptions = {
          email: order.user.email,
          subject: `Order ${status} - #${order._id}`,
          message: emailTemplate,
        };

        if (status === "Delivered") {
          try {
            console.log(`Generating PDF receipt for order #${order._id}`);
            const pdfBuffer = await generateReceiptPDF(order, order.user);

            emailOptions.attachments = [
              {
                filename: `HarmoniaHub_Receipt_${order._id}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ];
            console.log(`PDF receipt generated and attached for order #${order._id}`);
          } catch (pdfError) {
            console.error("Failed to generate PDF:", pdfError);
          }
        }

        console.log(`Sending ${status} email to: ${order.user.email}`);
        await sendEmail(emailOptions);
        console.log(`Status update email sent for order #${order._id} to ${order.user.email}`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order." });
  }
};
