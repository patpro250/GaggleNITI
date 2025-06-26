module.exports = async function (req, res, next) {
  if (!req.user || !req.user.name)
    return res.status(403).send("This action can be done by a School or institution director only.");
  next();
};
