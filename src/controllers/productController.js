const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');

// Obtener todos los productos
exports.getAllProducts = catchAsync(async (req, res) => {
  const products = await Product.find();
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

// Crear un nuevo producto
exports.createProduct = catchAsync(async (req, res) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { product: newProduct },
  });
});

// Obtener un producto por ID
exports.getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Producto no encontrado',
    });
  }
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});