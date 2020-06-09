const { Storage } = require('@google-cloud/storage');

/**
 *
 * Example of writing to a Google Cloud Storage (GCS) Bucket
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
  if (!process.env.GCLOUD_STORAGE_BUCKET)
    throw new Error('Google Bucket not set.');

  const storage = new Storage();
  const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

  const saveFile = (filename, contents) => {
    return new Promise((resolve, reject) => {
      const blob = bucket.file(filename);
      const stream = blob.createWriteStream({ resumable: false });
      stream.on('error', err => reject(err));
      stream.on('finish', () => {
        resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
      });
      stream.end(Buffer.from(contents));
    });
  };

  await saveFile(`safe_paths.json`, JSON.stringify(pages.cursor));

  for (let page of pages.files) {
    const filename = page.page_name.split('/').pop();
    await saveFile(filename, JSON.stringify(page));
  }
  return true;
};
