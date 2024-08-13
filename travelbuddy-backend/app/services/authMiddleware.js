const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET_KEY;

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(500).json({ message: "Failed to authenticate token" });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

exports.isAgent = (req, res, next) => {
  if (req.userRole !== "agent")
    return res.status(403).json({ message: "Access denied" });
  next();
};

exports.isDriver = (req, res, next) => {
  if (req.userRole !== "driver")
    return res.status(403).json({ message: "Access denied" });
  next();
};
