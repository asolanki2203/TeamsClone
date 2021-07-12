const { Router }= require('express');
const indexController= require('../Controllers/indexController');
const {requireAuth} = require('../middlewares/authMiddleware');

const router= Router();

router.get('/calls', requireAuth, indexController.getCalls);
router.get('/logout', requireAuth, indexController.logoutApp);
router.get('/meet', requireAuth, indexController.getMeet);
router.get('/help', indexController.getHelp);
router.get('/chatroom', requireAuth ,indexController.getChatRoom);

module.exports= router;