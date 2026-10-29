const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');
const Order = require('../../src/models/Order');

const API = '/api/v1';
const admin = { name: 'Admin Test', email: 'admin@moda.test', password: 'Admin2026*' };
const cliente = { name: 'Cliente Test', email: 'cliente@moda.test', password: 'Cliente2026*' };
const producto = { name: 'TEST Camiseta', description: 'Algodon', price: 50000, category: 'ropa', size: 'M', stock: 5 };
let adminToken, clienteToken, productId;

const limpiar = async () => {
  const users = await User.find({ email: /@moda\.test$/ });
  await Order.deleteMany({ user: { $in: users.map((u) => u._id) } });
  await User.deleteMany({ email: /@moda\.test$/ });
  await Product.deleteMany({ name: /^TEST / });
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await limpiar();
  await User.create({ ...admin, role: 'admin' });
  const login = await request(app).post(API + '/auth/login').send({ email: admin.email, password: admin.password });
  adminToken = login.body.token;
});

afterAll(async () => {
  await limpiar();
  await mongoose.disconnect();
});

describe('Salud y autenticación', () => {
  test('GET /health responde 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /auth/register crea usuario con rol user aunque se envíe admin', async () => {
    const res = await request(app).post(API + '/auth/register').send({ ...cliente, role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.role).toBe('user');
    clienteToken = res.body.token;
  });

  test('POST /auth/register con correo repetido responde 400', async () => {
    const res = await request(app).post(API + '/auth/register').send(cliente);
    expect(res.status).toBe(400);
  });

  test('POST /auth/login con credenciales correctas devuelve token', async () => {
    const res = await request(app).post(API + '/auth/login').send({ email: cliente.email, password: cliente.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /auth/login con contraseña incorrecta responde 401', async () => {
    const res = await request(app).post(API + '/auth/login').send({ email: cliente.email, password: 'incorrecta' });
    expect(res.status).toBe(401);
  });
});

describe('Productos y control de acceso', () => {
  test('GET /products es público y responde 200', async () => {
    const res = await request(app).get(API + '/products');
    expect(res.status).toBe(200);
    expect(typeof res.body.results).toBe('number');
  });

  test('POST /products sin token responde 401', async () => {
    const res = await request(app).post(API + '/products').send(producto);
    expect(res.status).toBe(401);
  });

  test('POST /products con token de cliente responde 403', async () => {
    const res = await request(app).post(API + '/products').set('Authorization', 'Bearer ' + clienteToken).send(producto);
    expect(res.status).toBe(403);
  });

  test('POST /products con token de admin crea el producto (201)', async () => {
    const res = await request(app).post(API + '/products').set('Authorization', 'Bearer ' + adminToken).send(producto);
    expect(res.status).toBe(201);
    productId = res.body.data.product._id;
  });

  test('GET /products/:id devuelve el producto creado', async () => {
    const res = await request(app).get(API + '/products/' + productId);
    expect(res.status).toBe(200);
    expect(res.body.data.product.name).toBe(producto.name);
  });

  test('GET /products/:id inexistente responde 404', async () => {
    const res = await request(app).get(API + '/products/64b7f0f0f0f0f0f0f0f0f0f0');
    expect(res.status).toBe(404);
  });

  test('PUT /products/:id con admin actualiza el precio', async () => {
    const res = await request(app).put(API + '/products/' + productId).set('Authorization', 'Bearer ' + adminToken).send({ price: 60000 });
    expect(res.status).toBe(200);
    expect(res.body.data.product.price).toBe(60000);
  });
});

describe('Órdenes y stock', () => {
  test('POST /orders descuenta el stock del producto', async () => {
    const res = await request(app).post(API + '/orders').set('Authorization', 'Bearer ' + clienteToken)
      .send({ items: [{ product: productId, quantity: 2 }] });
    expect(res.status).toBe(201);
    const actualizado = await Product.findById(productId);
    expect(actualizado.stock).toBe(3);
  });

  test('POST /orders con cantidad mayor al stock responde 400', async () => {
    const res = await request(app).post(API + '/orders').set('Authorization', 'Bearer ' + clienteToken)
      .send({ items: [{ product: productId, quantity: 100 }] });
    expect(res.status).toBe(400);
  });

  test('GET /orders sin token responde 401', async () => {
    const res = await request(app).get(API + '/orders');
    expect(res.status).toBe(401);
  });

  test('GET /orders con token lista las órdenes del usuario', async () => {
    const res = await request(app).get(API + '/orders').set('Authorization', 'Bearer ' + clienteToken);
    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
  });

  test('DELETE /products/:id con admin responde 204', async () => {
    const res = await request(app).delete(API + '/products/' + productId).set('Authorization', 'Bearer ' + adminToken);
    expect(res.status).toBe(204);
  });
});
