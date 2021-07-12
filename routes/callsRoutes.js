const { Router }= require('express');
const callsController= require('../Controllers/callsController');
const {requireAuth} = require('../middlewares/authMiddleware');

const router= Router();

router.post('/calls', callsController.getUser);
router.post('/callUser', callsController.callUser);
router.get('/video_call', requireAuth, callsController.getVideoRoom);
router.get('/video_call/:room',requireAuth, callsController.enterVideoRoom);

module.exports= router;