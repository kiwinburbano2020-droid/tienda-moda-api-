const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(compression());

// Rutas de la API
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));

app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV, timestamp: new Date() });
});

// Manejador global de errores (validación, IDs inválidos, etc.)
app.use((err, req, res, next) => {
    const status = ['ValidationError', 'CastError'].includes(err.name) ? 400 : 500;
    res.status(status).json({ status: status === 400 ? 'fail' : 'error', message: err.message });
});

module.exports = app;