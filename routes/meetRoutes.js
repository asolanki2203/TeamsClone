const { Router }= require('express');
const meetController= require('../Controllers/meetController');
const {requireAuth} = require('../middlewares/authMiddleware');

const router= Router();

router.post('/createCall', requireAuth, meetController.createCall);
router.get('/group_call/:room', requireAuth, meetController.groupCall);

module.exports= router;