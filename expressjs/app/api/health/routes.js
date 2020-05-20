const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.post('/webhook/email', server.wrapAsync(async (req, res) => await controller.health(req, res)))

// // *** GET health *** //
// router.get('/health', function(req, res) {
//   res.status(200).json({
//     message: 'All Ok!'
//   });
// });