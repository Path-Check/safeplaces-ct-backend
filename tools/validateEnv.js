const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const chalk = require('chalk');

// Instantiate an ajv object.
const ajv = new Ajv({
  coerceTypes: true, // Enable type coercion.
  allErrors: true, // Output all validation errors.
});

// Read and parse the JSON schema.
const schema = JSON.parse(
  fs
    .readFileSync(path.resolve(__dirname, '../env.schema.json'))
    .toString('utf-8'),
);

// Compile the schema and obtain the validation function.
const validate = ajv.compile(schema);

/**
 * Validates the environment variables.
 *
 * @param env The environment variables object
 * @returns an array [valid, errors], where valid is a boolean and errors is
 * an array of validation errors, if any
 */
function check(env) {
  const valid = validate(env);
  return [valid, validate.errors];
}

/**
 * Logs the errors to console in a fancy format.
 *
 * @param errors The array of validation errors
 */
function print(errors) {
  // Convert the array of raw errors to text format.
  const text = ajv.errorsText(errors, { dataVar: 'env', separator: ';' });

  // Convert the error text to an array of formatted errors.
  const textArr = text.split(';');

  for (let report of textArr) {
    // Remove the `env.` prefix from the error message.
    report = report.replace('env.', 'env ');
    console.error(`[ ${chalk.redBright('✗')} ]  ${report}`);
  }

  console.error('');
}

/**
 * Validates the environment variables and logs the process to console
 * in a fancy format.
 *
 * @param env The environment variables object to validate
 */
function prettyCheck(env) {
  console.log(
    `\n[ ${chalk.blueBright('?')} ]  Validating environment variables...`,
  );

  // Validate the environment variables.
  const [valid, errors] = check(env);

  // If there is a validation error, log the errors messages in a pretty format.
  // Else, log that the validation has completed successfully.
  if (!valid) {
    print(errors);
  } else {
    console.log(
      `[ ${chalk.greenBright('✓')} ]  All environment variables valid\n`,
    );
  }
}

module.exports = prettyCheck;
