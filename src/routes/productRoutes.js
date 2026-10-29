const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Ruta para obtener todos los productos y crear un nuevo producto
router
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

// Ruta para buscar un producto específico por ID
router
  .route('/:id')
  .get(productController.getProductById);

module.exports = router;