const { Router }= require('express');
const homeController= require('../Controllers/homeController');
const {requireAuth} = require('../middlewares/authMiddleware');
const passport = require('passport');

const router= Router();

router.get('/', requireAuth, homeController.getHome);
router.get('/login', homeController.getLogin);
router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports= router;