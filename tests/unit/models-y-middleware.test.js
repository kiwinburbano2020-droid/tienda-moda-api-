const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');
const { protect, restrictTo } = require('../../src/middlewares/authMiddleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const productoValido = {
  name: 'Camiseta', description: 'Algodon', price: 50000,
  category: 'ropa', size: 'M', stock: 10,
};

describe('Modelo User', () => {
  test('falla si falta el nombre', () => {
    const err = new User({ email: 'a@a.com', password: '123456' }).validateSync();
    expect(err.errors.name).toBeDefined();
  });
  test('falla si la contraseña tiene menos de 6 caracteres', () => {
    const err = new User({ name: 'A', email: 'a@a.com', password: '123' }).validateSync();
    expect(err.errors.password).toBeDefined();
  });
  test('asigna el rol "user" por defecto', () => {
    expect(new User({ name: 'A', email: 'a@a.com', password: '123456' }).role).toBe('user');
  });
  test('rechaza un rol inválido', () => {
    const err = new User({ name: 'A', email: 'a@a.com', password: '123456', role: 'root' }).validateSync();
    expect(err.errors.role).toBeDefined();
  });
  test('comparePassword devuelve true con la clave correcta', async () => {
    const hash = await bcrypt.hash('Clave123*', 10);
    const u = new User({ name: 'A', email: 'a@a.com', password: hash });
    expect(await u.comparePassword('Clave123*')).toBe(true);
  });
  test('comparePassword devuelve false con una clave incorrecta', async () => {
    const hash = await bcrypt.hash('Clave123*', 10);
    const u = new User({ name: 'A', email: 'a@a.com', password: hash });
    expect(await u.comparePassword('otraClave')).toBe(false);
  });
});

describe('Modelo Product', () => {
  test('acepta un producto válido', () => {
    expect(new Product(productoValido).validateSync()).toBeUndefined();
  });
  test('falla si falta el precio', () => {
    const { price, ...sinPrecio } = productoValido;
    expect(new Product(sinPrecio).validateSync().errors.price).toBeDefined();
  });
  test('rechaza precio negativo', () => {
    expect(new Product({ ...productoValido, price: -5 }).validateSync().errors.price).toBeDefined();
  });
  test('rechaza una categoría fuera del enum', () => {
    expect(new Product({ ...productoValido, category: 'autos' }).validateSync().errors.category).toBeDefined();
  });
});

describe('Middlewares de autenticación', () => {
  test('protect responde 401 si no hay token', async () => {
    const res = mockRes(); const next = jest.fn();
    await protect({ headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
  test('protect responde 401 si el token es inválido', async () => {
    const res = mockRes(); const next = jest.fn();
    await protect({ headers: { authorization: 'Bearer token.falso.123' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
  test('restrictTo responde 403 si el rol no está permitido', () => {
    const res = mockRes(); const next = jest.fn();
    restrictTo('admin')({ user: { role: 'user' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  test('restrictTo deja pasar al rol admin', () => {
    const res = mockRes(); const next = jest.fn();
    restrictTo('admin')({ user: { role: 'admin' } }, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('JWT', () => {
  test('un token firmado se puede verificar y conserva el id', () => {
    const token = jwt.sign({ id: 'abc123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    expect(jwt.verify(token, process.env.JWT_SECRET).id).toBe('abc123');
  });
});
