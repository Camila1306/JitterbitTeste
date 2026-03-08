const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  const validUser = process.env.AUTH_USER || "admin";
  const validPassword = process.env.AUTH_PASSWORD || "admin123";

  if (username !== validUser || password !== validPassword) {
    return res.status(401).json({ error: "Credenciais invalidas." });
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET || "change-this-secret",
    { expiresIn: "1h" }
  );

  return res.status(200).json({ token });
});

module.exports = router;
