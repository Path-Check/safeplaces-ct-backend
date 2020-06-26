module.exports = {
  file: {
    level: 'info',
    filename: process.env.LOGGER_FILE || `/tmp/safe_paths.log`,
    handleExceptions: true,
    exitOnError: false,
    json: true,
    maxsize: 5242880, // 5MB file chunks
    maxFiles: 5,
  },
  output: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    align: true,
    exitOnError: false,
    colorize: true,
    levels: {
      critical: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    },
    colors: {
      critical: 'red bold',
      error: 'red italic',
      warn: 'yellow bold',
      info: 'green',
      debug: 'blue',
    },
  },
};
