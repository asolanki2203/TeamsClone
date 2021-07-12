const { Router }= require('express');
const chatController= require('../Controllers/chatController');
const {requireAuth} = require('../middlewares/authMiddleware');

const router= Router();

router.get('/chat', requireAuth, chatController.getChat);
router.post('/addchat', chatController.addChat);
router.post('/getPersonalChat', chatController.getPersonalChat);

module.exports= router;