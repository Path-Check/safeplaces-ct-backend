// const { GoogleAuth } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');

const client = new SecretManagerServiceClient();

/**
 *
 * Example of writing to a Google Cloud Storage (GCS) Bucket
 *
 * This is simple logic that will save the published files that are needed
 * for the Mobile apps to download data from. You will want to create your own
 * logic here and save to a public location. Your organizations API Endpoint
 * should point to the directory that the cursor.json file is located in.
 *
 * @method writePublishedFiles
 * @param {Object} pages
 * @return {Boolean}
 */

async function pullSecret() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('[GCS] Using Application Credentials');
    return true;
  }

  if (!process.env.GOOGLE_SECRET) {
    console.log('[GCS] Google Secret is invalid, falling back.');
    return true;
  }

  const saveCredentialsFile = (file, contents) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, contents, err => {
        if (err) reject(err);
        resolve(true);
      });
    });
  };

  const fileName = '/tmp/creds.json';

  const [accessResponse] = await client.accessSecretVersion({
    name: process.env.GOOGLE_SECRET,
  });
  if (accessResponse) {
    const responsePayload = accessResponse.payload.data.toString('utf8');
    if (responsePayload) {
      const credsSaved = await saveCredentialsFile(fileName, responsePayload);
      if (credsSaved) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = fileName;
        return true;
      } else {
        throw new Error('Problem saving credentials file.');
      }
    } else {
      throw new Error('Problem getting access secret response.');
    }
  } else {
    throw new Error('Access Response is invalid.');
  }
}

module.exports = async pages => {
  if (!process.env.GCLOUD_STORAGE_BUCKET)
    throw new Error('Google Bucket not set.');

  let path = '';
  if (process.env.GCLOUD_STORAGE_PATH) {
    path = process.env.GCLOUD_STORAGE_PATH + '/';
  }

  console.log(`[GCS] Bucket: `, process.env.GCLOUD_STORAGE_BUCKET);
  console.log(`[GCS] Path: `, path);

  const secret = await pullSecret();
  if (secret) {
    const storage = new Storage();
    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

    const saveFile = (filename, contents) => {
      return new Promise((resolve, reject) => {
        const blob = bucket.file(filename);
        const stream = blob.createWriteStream({ resumable: false });
        stream.on('error', err => reject(err));
        stream.on('finish', () => {
          console.log(
            `[GCS] Full Path: https://storage.googleapis.com/${bucket.name}/${path}${blob.name}`,
          );
          resolve(
            `https://storage.googleapis.com/${bucket.name}/${path}${blob.name}`,
          );
        });
        stream.end(Buffer.from(contents));
      });
    };

    await saveFile(`${path}cursor.json`, JSON.stringify(pages.cursor));

    for (let page of pages.files) {
      const filename = page.page_name.split('/').pop();
      await saveFile(path + filename, JSON.stringify(page));
    }
  } else {
    throw new Error('Secrets file could not be generated');
  }

  return true;
};
