//middleware to protect routes from inauthenticated users
const requireAuth= function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports = {requireAuth};