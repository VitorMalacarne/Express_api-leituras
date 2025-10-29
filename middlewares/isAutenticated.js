const isAutenticated = (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization && authorization === "123123") return next();

  return res.status(401).json({ message: "Token inválido" });
};

module.exports = isAutenticated;
