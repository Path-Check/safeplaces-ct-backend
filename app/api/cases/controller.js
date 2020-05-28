const cases = require('../../../db/models/cases');

/**
 * @method health
 *
 * Health Check
 *
 */
exports.publish = async (req, res) => {
  const { query: { ids } } = req;
  
  if (!ids) {
    res.status(400).send('Bad request');
  }

  const idArr = ids.split(',');
  if (idArr.length === 0) {
    res.status(400).send('Bad request');
  }

  let id;
  let results = [];
  for (id of idArr) {
    const result = await cases.updateState(id, 'published');
    if (result) {
      results.push(result);
    }
  }
  res.status(200).json({ result: results });
};
