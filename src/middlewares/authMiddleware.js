const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'No está autorizado para acceder a esta ruta',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key_default'
    );
    
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no válido o expirado',
    });
  }
};