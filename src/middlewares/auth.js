const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authRequired = String(process.env.AUTH_REQUIRED || "false") === "true";

  if (!authRequired) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token JWT nao informado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "change-this-secret";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token JWT invalido ou expirado." });
  }
}

module.exports = { authMiddleware };