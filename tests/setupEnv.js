require('dotenv').config({ path: '.env.test' });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_ci';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moda_test';
