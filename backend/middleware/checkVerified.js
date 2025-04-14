module.exports = (req, res, next) => {
    if (!req.user || !req.user.email_verified) {
      return res.status(403).json({ message: "Please verify your email to access this resource." });
    }
    next();
  };
  