const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');
const ajv = new Ajv();

// Parse the JSON schema.
const schema = JSON.parse(fs
  .readFileSync(path.resolve(__dirname, '../../config.schema.json'))
  .toString('utf-8'));
// Compile the JSON schema.
const check = ajv.compile(schema);

/**
 * Validates the json based on the pre-defined schema.
 * @param json The JSON to validate.
 * @returns a boolean of whether the JSON is valid.
 */
function validate(json) {
  const valid = check(json);
  return [valid, check.errors];
}

module.exports = { validate };