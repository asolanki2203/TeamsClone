const { Router }= require('express');
const roomController= require('../Controllers/roomController');
const {requireAuth} = require('../middlewares/authMiddleware');

const router= Router();

router.post('/createRoom', requireAuth, roomController.createRoom);
router.get('/chat_room/:room', requireAuth, roomController.chatRoom);

module.exports= router;