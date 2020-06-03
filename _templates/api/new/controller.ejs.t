---
to: app/api/<%= name %>/controller.js
---
// app/api/<%= name %>/controller.js

/**
 * @method health
 *
 * Health Check
 *
 */
exports.health = async (req, res) => {
  const data = {
    message: 'All Ok!',
  };

  res.status(200).json(data);
};
