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
 * should point to the directory that the safe_paths.json file is located in.
 *
 * @method writePublishedFiles
 * @param {Object} pages
 * @return {Boolean}
 */

// async function main() {
//   // https://www.googleapis.com/auth/cloud-platform
//   // https://www.googleapis.com/auth/cloud-platform.read-only
//   // https://www.googleapis.com/auth/ndev.clouddns.readonly
//   // https://www.googleapis.com/auth/ndev.clouddns.readwrite”’,

//   const auth = new GoogleAuth({
//     scopes: [
//       'https://www.googleapis.com/auth/cloud-platform',
//       'https://www.googleapis.com/auth/cloud-platform.read-only',
//       'https://www.googleapis.com/auth/devstorage.read_write',
//       'https://www.googleapis.com/auth/ndev.clouddns.readwrite',
//     ],
//   });
//   const client = await auth.getClient();
//   const projectId = await auth.getProjectId();
//   const url = `https://dns.googleapis.com/dns/v1/projects/${projectId}`;
//   const res = await client.request({ url });
//   console.log(res.data);
// }

// if (process.env.GOOGLE_SERVICE_EMAIL) {
//   main().catch(console.error);
// }


/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// parent = 'projects/my-project', // Project for which to manage secrets.
// secretId = 'foo', // Secret ID.
// payload = 'hello world!' // String source data.

async function pullSecret() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return true

  const saveCredentialsFile = (file, contents) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, contents, err => {
        if (err) reject(err);
        resolve(true);
      });
    });
  };

  const fileName = '/tmp/creds.json'

  const [accessResponse] = await client.accessSecretVersion({ name: process.env.GOOGLE_SECRET });
  const responsePayload = accessResponse.payload.data.toString('utf8');
  if (responsePayload) {
    const credsSaved = await saveCredentialsFile(fileName, responsePayload)
    if (credsSaved) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = fileName
      return true
    } else {
      throw new Error('Problem saving credentials file.')
    }
  } else {
    throw new Error('Problem getting access secret response.')
  }
}

module.exports = async pages => {
  if (!process.env.GCLOUD_STORAGE_BUCKET)
    throw new Error('Google Bucket not set.');

  const secret = await pullSecret()
  if (secret) {
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
  } else {
    throw new Error('Secrets file could not be generated')
  }

  return true;
};
