module.exports = function checkPermissions(requiredPermissions) {
    return (req, res, next) => {
        // if (!req.user || !req.user.permissions) {
        //     return res.status(401).send("Missing user permissions.");
        // }

        // const hasPermission = requiredPermissions.every((perm) => req.user.permissions.includes(perm));
        // if (!hasPermission) return res.status(403).send(`You don't have the required permissions`)
        next();
    }
}