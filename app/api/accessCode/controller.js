const { accessCodeService } = require('../../../app/lib/db');

/**
 * @method generate
 *
 * Generates a new access code for use with the Ingest/Upload service.
 *
 */
exports.generate = async (req, res) => {
  const code = await accessCodeService.create();

  if (code == null || code.value == null) {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  res.status(201).json({
    accessCode: code.value,
  });
};
