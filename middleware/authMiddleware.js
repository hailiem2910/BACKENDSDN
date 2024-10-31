// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const authMiddleware = async (req, res, next) => {
//   // Log the Authorization header to check if the token is passed
//   console.log("Authorization header:", req.headers["authorization"]);
//   console.log("JWT_SECRET:", process.env.JWT_SECRET); // Check if JWT_SECRET is loaded

//   const token = req.headers["authorization"];
//   if (!token)
//     return res.status(403).send("A token is required for authentication");

//   try {
//     const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
//     console.log("Decoded Token:", decoded); // Log decoded token
//     req.user = await User.findById(decoded.id);
//     next();
//   } catch (error) {
//     console.error("Token verification error:", error); // Log any token verification errors
//     return res.status(401).send("Invalid Token");
//   }
// };

// module.exports = authMiddleware;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader);

    if (!authHeader) {
      return res.status(403).json({ 
        message: "No authorization header found" 
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ 
        message: "Invalid authorization format. Must start with 'Bearer'" 
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ 
        message: "No token found in authorization header" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token",
        error: error.message 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expired",
        error: error.message 
      });
    }

    return res.status(500).json({ 
      message: "Authentication error",
      error: error.message 
    });
  }
};

module.exports = authMiddleware;
