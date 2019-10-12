require('dotenv').config();
const https = require("https");
const moment = require("moment");
require("moment-timezone");

const authHelper = require("./lib/authHelper.js");

// Imports the Google Cloud client library
const {
  Storage
} = require('@google-cloud/storage');

let GCP_CLIENT = null; // Lazy Initialzation
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.processUpload = (req, res) => {

  var opts = {
    req: req,
    res: res
  }
  if (!authHelper().verifyToken(opts)) return;

  var buffer = req.body.buffer;
  var url = req.body.url;
  var bucketName = req.body.bucket ? req.body.bucket : process.env.DEFAULT_BUCKET_NAME;
  var filename = req.body.filename ? req.body.filename : moment.tz(new Date(), process.env.DEFAULT_TIMEZONE).format("YYYYMMDD_hhmmss") + ".jpg";
  var metadata = req.body.metadata ? req.body.metadata : {};

  if (buffer == null && url == null) res.end("Bad request");
  if (buffer != null && url != null) res.end("Bad request");

  console.log(`URL : ${url}`);
  console.log(`Bucket : ${bucketName}`);
  console.log(`Filename : ${filename}`);

  // Initialize
  initialize();

  // Proceed Upload
  if (url != null) {
    downloadFileAsBuffer(url, (buffer) => {
      proceedUpload(opts, bucketName, filename, buffer, metadata)
    });
  } else {
    buffer = Buffer.from(buffer, 'base64');
    proceedUpload(opts, bucketName, filename, buffer, metadata);
  }
}

/**
 * Proceed Google Storage Upload
 */
function proceedUpload(opts, bucketName, filename, buffer, metadata) {

  const bucket = GCP_CLIENT.bucket(bucketName);
  const file = bucket.file(filename);

  // Upload it via buffer
  const stream = file.createWriteStream({
    metadata: {
      contentType: 'image/jpeg',
      metadata: {
        "custom": JSON.stringify(metadata)
      }
    }
  });
  stream.on('error', (err) => {
    let response = {
      code: "409",
      message: "Fail to upload"
    }
    opts.res.status(200).send(JSON.stringify(response));
  });
  stream.on('finish', () => {
    console.log(`Success upload to ${filename}`);

    GCP_CLIENT
      .bucket(bucketName)
      .file(filename)
      .makePublic(() => {
        let returnURL = process.env.PUBLIC_URL;
        returnURL = returnURL.replace("{{BUCKET_NAME}}", bucketName);
        returnURL = returnURL.replace("{{FILENAME}}",filename);
        console.log("Make public")
        let response = {
          code: "000",
          filename: returnURL
        }
        opts.res.status(200).send(JSON.stringify(response));
        console.log("Completed");
      });


  });
  stream.end(buffer);
}

function initialize() {
  if (GCP_CLIENT == null) {
    console.log("=============================================================");
    console.log("Google Application Credentials : " + process.env.GOOGLE_APPLICATION_CREDENTIALS);
    GCP_CLIENT = new Storage();
    console.log("=============================================================");
  }
  return GCP_CLIENT;
}

/**
 * Download from Given url
 * @param {String} url 
 * @param {Function} callback 
 */
function downloadFileAsBuffer(url, callback) {

  // Download the File and return as Base64 Buffer
  https.get(url, function (response) {
    var buffer = Buffer.alloc(0);

    // Download in progress
    response.on('data', (d) => {
      buffer = Buffer.concat([buffer, Buffer.from(d, "binary")]);
    });

    // Download Completed
    response.on('end', async () => {
      console.log(`Download completed. Size :  ${buffer.length}`);
      callback(buffer);
    });
  });
}