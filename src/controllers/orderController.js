const Order = require('../models/Order');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');

exports.createOrder = catchAsync(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'La orden debe tener al menos un producto' });
  }

  const orderItems = [];
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Producto no encontrado' });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ status: 'fail', message: 'Cantidad inválida' });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ status: 'fail', message: 'Stock insuficiente para ' + product.name });
    }
    orderItems.push({ product: product._id, quantity: item.quantity, price: product.price });
    total += product.price * item.quantity;
  }

  for (const it of orderItems) {
    await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity } });
  }
  const order = await Order.create({ user: req.user._id, items: orderItems, total });
  res.status(201).json({ status: 'success', data: { order } });
});

exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

exports.getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    return res.status(404).json({ status: 'fail', message: 'Orden no encontrada' });
  }
  res.status(200).json({ status: 'success', data: { order } });
});
