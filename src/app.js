const express = require("express");
const swaggerUi = require("swagger-ui-express");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const swaggerSpec = require("./docs/swagger");

require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Orders API is running",
    docs: "http://localhost:3000/docs"
  });
});

app.use("/auth", authRoutes);
app.use("/order", orderRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Internal server error"
  });
});

module.exports = app;
