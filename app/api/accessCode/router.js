const { router } = require('../../../app');
const controller = require('./controller');

router.post(
  '/access-code',
  router.wrapAsync(
    async (req, res) => await controller.generate(req, res),
    true,
  ),
);
