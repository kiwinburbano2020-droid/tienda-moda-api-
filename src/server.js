require("dotenv").config({ path: ".env." + (process.env.NODE_ENV || "development") });
const app = require("./app");
const connectDB = require("./config/database");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info("Servidor ejecutandose en el puerto " + PORT + " [Modo: " + (process.env.NODE_ENV || "development") + "]");
  });
});
