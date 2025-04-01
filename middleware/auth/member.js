module.exports = async function (req, res, next) {
  if (!req.user || !req.user.id)
    return res.status(403).send("This action can be done by a Member only.");
  next();
};
