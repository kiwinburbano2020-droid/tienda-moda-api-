# 📄 Documentación de Rutas y Endpoints - Tienda Moda API

Este documento detalla los endpoints disponibles para la API (Sprint 2).

## 🔐 1. Módulo de Autenticación (/api/v1/auth)
- **POST /api/v1/auth/register**: Registro de usuarios con Bcrypt.
- **POST /api/v1/auth/login**: Inicio de sesión y generación de JWT.

## 🛍️ 2. Módulo de Productos (/api/v1/products)
- **GET /api/v1/products**: Obtener todos los productos.
- **POST /api/v1/products**: Crear un producto.
- **GET /api/v1/products/:id**: Obtener producto por ID.

## 🩺 3. Monitoreo
- **GET /health**: Health check del servidor.
