# Documentación de la API - Postman

En el siguiente enlace se encuentra la colección oficial de endpoints para probar la API Tienda Moda:

?? **[Ver Colección de Postman](https://kiwinburbano2020-2690433.postman.co/workspace/KIWIN-DAMIAN-BURBANO-CABEZAS's-~1de5a986-3e19-49ba-8d05-cbb9f73155dc/collection/59291140-3d98d5a1-0f5a-43bc-b18a-e2e7a3956756?action=share&creator=59291140)**

---

## Variables de Entorno

Para desplegar y ejecutar esta API localmente o en un entorno de producción, se deben configurar las siguientes variables de entorno en un archivo .env en la raíz del proyecto (ver plantilla en .env.example):

| Variable | Descripción | Valor de Ejemplo |
| :--- | :--- | :--- |
| PORT | Puerto en el que escucha el servidor Express | 3000 |
| NODE_ENV | Entorno de ejecución (development, 	est, production) | development |
| MONGODB_URI | Cadena de conexión a la base de datos MongoDB Atlas | mongodb+srv://... |
| JWT_SECRET | Clave secreta para firmar y verificar tokens JWT | super_secret_key |
| JWT_EXPIRES_IN | Tiempo de expiración del token de autenticación | 24h |
