const path = require('path');
const config = path.join(__dirname, '../../config/db');

const db = require('@sublet/data-layer')(config);

module.exports = db.services