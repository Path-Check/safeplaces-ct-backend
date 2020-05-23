const cases = require('../../../db/models/cases');

/**
 * @method health
 *
 * Health Check
 *
 */
exports.publish = async (req, res) => {
  const { query } = req;
  const { ids } = query;
  if (!ids) {
    res.status(400).send('Bad request');
  }
  const idArr = ids.split(',');
  if (idArr.length === 0) {
    res.status(400).send('Bad request');
  }
  let results = [];
  for (const id of idArr) {
    const result = await cases.updateState(id, 'published');
    console.log(result);
    results.push(result[0]);
  }
  res.status(200).json({ result: results });
};
