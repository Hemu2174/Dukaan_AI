const jwt = require("jsonwebtoken");

function generateToken(user, role = "owner") {
  return jwt.sign(
    {
      user_id: user.id,
      role: role
    },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: "7d" }
  );
}

module.exports = { generateToken };
