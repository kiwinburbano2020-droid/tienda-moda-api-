const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.route('/').post(orderController.createOrder).get(orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
