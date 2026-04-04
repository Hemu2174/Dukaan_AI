const jwt = require("jsonwebtoken");

function generateToken(user, role = "owner") {
  const payload = {
    id: user.id || user._id,
    user_id: user.id || user._id,
    role: role
  };

  // Add owner_id for helpers
  if (user.owner_id) {
    payload.owner_id = user.owner_id;
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: "7d" }
  );
}

module.exports = { generateToken };
