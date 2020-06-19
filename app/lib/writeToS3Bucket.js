const S3 = require('aws-sdk/clients/s3');

/**
 *
 * Example of writing to an AWS S3 Bucket
 *
 * This is simple logic that will save the published files that are needed
 * for the Mobile apps to download data from. You will want to create your own
 * logic here and save to a public location. Your organizations API Endpoint
 * should point to the directory that the safe_paths.json file is located in.
 *
 * @method writePublishedFiles
 * @param {Object} pages
 * @return {Boolean}
 */

module.exports = async pages => {
  if (!process.env.S3_BUCKET) throw new Error('S3 bucket not set.');
  if (!process.env.S3_REGION) throw new Error('S3 region not set.');
  if (!process.env.S3_ACCESS_KEY) throw new Error('S3 access key not set.');
  if (!process.env.S3_SECRET_KEY) throw new Error('S3 secret not set.');

  const storage = new S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  });

  const saveFile = (filename, contents) => {
    const config = {
      Key: filename,
      Bucket: process.env.S3_BUCKET,
      Body: Buffer.from(contents),
    };
    return new Promise((resolve, reject) => {
      storage.upload(config, function (err, data) {
        if (err != null) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  await saveFile(`safe_paths.json`, JSON.stringify(pages.cursor));

  for (let page of pages.files) {
    const filename = page.page_name.split('/').pop();
    await saveFile(filename, JSON.stringify(page));
  }

  return true;
};
