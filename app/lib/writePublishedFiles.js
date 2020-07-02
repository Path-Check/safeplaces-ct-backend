const fs = require('fs');

/**
 *
 * This is simple logic that will save the published files that are needed
 * for the Mobile apps to download data from. You will want to create your own
 * logic here and save to a public location. Your organizations API Endpoint
 * should point to the directory that the cursor.json file is located in.
 *
 * @method writePublishedFiles
 * @param {Object} pages
 * @param {String} baseLocation
 * @return {Boolean}
 */

module.exports = async (pages, baseLocation) => {
  const mkdir = path => {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, { recursive: true }, err => {
        if (err) reject(err);
        resolve(true);
      });
    });
  };

  const saveFile = (file, contents) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, contents, err => {
        if (err) reject(err);
        resolve(true);
      });
    });
  };

  const results = await mkdir(`${baseLocation}`);
  if (results) {
    await saveFile(`${baseLocation}/cursor.json`, JSON.stringify(pages.cursor));
    let page, filename;
    for (page of pages.files) {
      filename = page.page_name.split('/').pop();
      await saveFile(`${baseLocation}/${filename}`, JSON.stringify(page));
    }
    return true;
  } else {
    throw new Error('Could not create directory.');
  }
};
