const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: [true, 'El nombre del producto es obligatorio'], trim: true },
  categoria: { type: String, required: true, enum: ['Calzado', 'Ropa Superior', 'Ropa Inferior', 'Accesorios'] },
  talla: { type: String, required: true },
  color: { type: String, required: true },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
