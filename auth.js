const jwt = require('jsonwebtoken')

//auth
function auth(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).send({
      message: "token is missing",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.Id;
    next();
  } catch (error) {
   res.status(403).json({
      message: "invalid or expired token",
    });
  }

  
}

module.exports = {
    auth
}