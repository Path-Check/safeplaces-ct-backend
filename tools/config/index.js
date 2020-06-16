/**
 * Configuration loader
 *
 * The configuration loader looks for a configuration file in one of two places:
 * 1. The root of the project, at `/config.yaml`.
 * 2. The path specified via command-line arguments, using the flag `--config`.
 *
 * It reads the YAML file into memory, throwing helpful errors if any problems
 * occur, and then validates its schema based on a pre-defined schema.
 *
 * The schema validation helper is `schema.js` and uses the `config.schema.json`
 * file as the schema. The schema uses the standardized JSON schema draft-07.
 *
 * The end result is the configuration in JSON format.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { argv } = require('yargs');
const { validate } = require('./schema');

// Try to load the configuration file.
const config = parse(getConfigPath());

/**
 * Determines the path to the configuration file.
 *
 * @returns the path to the configuration file.
 */
function getConfigPath() {
  // THe configuration path can be modified using the `--config` flag.
  // Default to the `config.yaml` file at the root of the application.
  return argv.config || 'config.yaml';
}

/**
 * Parses the configuration file at the specified file path.
 *
 * @param filePath The path to the configuration file.
 * @returns the parsed configuration data in JSON format.
 */
function parse(filePath) {
  // Resolve the location of the configuration file based on the current
  // working directory and the specified file path.
  const absPath = path.resolve(process.cwd(), filePath);

  // Try to read the file at the location.
  let data;
  try {
    data = fs.readFileSync(absPath).toString('utf-8');
  } catch (err) {
    // Catch a file not found error and throw a meaningful error message.
    if (err.message.startsWith('ENOENT: no such file or directory')) {
      throw new Error(
        `Unable to find configuration file at ${absPath}. ` +
        `Try duplicating the 'config.template.yaml' file.`, // TODO: Create template
      );
    }
    throw err;
  }

  // Throw an error if there is nothing in the configuration file.
  if (data === '') {
    throw new Error('The YAML configuration file is empty');
  }

  // Try to parse the configuration file, and throw an error
  // if the file is invalid.
  let parsed;
  try {
    parsed = yaml.parse(data);
  } catch (err) {
    throw new Error(
      'An error occurred while trying to parse the YAML configuration file: ' +
      err.message,
    );
  }

  // Validate the parsed YAML using the pre-defined schema.
  const [valid, errors] = validate(parsed);
  if (!valid) {
    console.error('The configuration schema is invalid:');
    console.error(errors);
    throw new Error('Invalid configuration');
  }

  // All tests has passed, return the configuration JSON.
  return parsed;
}

/**
 * Gets the configuration data.
 *
 * @returns the configuration data in JSON format.
 */
function get() {
  return config;
}

module.exports = { get };
