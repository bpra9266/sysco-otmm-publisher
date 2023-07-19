import FormData from 'form-data';
import pino from 'pino';
import axios from 'axios';
import * as fs from 'fs';
import { HEADERS, ASSET_REPRESENTATION } from "./constants.js";

// Define API endpoint and rate limit settings
const apiUrl = process.env.IMPORT_ASSET;
const maxRequestsPerSecond = 1; // Maximum number of requests per second
const requestInterval = 10000 / maxRequestsPerSecond; // Time interval between requests in milliseconds

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// variable to store the rate limit (in milliseconds)
const rateLimit = 6000;

// Define function to upload a single file using multipart/form-data
const uploadFile = async (filePath) => {

  const formData = new FormData();
  const fileExtension = filePath.split('.').pop();
  const fileName = filePath.split('/').pop();

  formData.append('files', fs.createReadStream(filePath));
  formData.append('parent_folder_id', process.env.PARENT_FOLDER_ID);
  // formData.append('asset_representation', JSON.stringify(ASSET_REPRESENTATION)); // No need since template id is configured
  formData.append('import_template_id', process.env.IMPORT_TEMPLATE_ID);
  const manifest = {
    upload_manifest: {
      master_files: [
        {
          file: {
            file_name: fileName,
            file_type: "image/" + fileExtension
          }
        }
      ]
    }
  }

  formData.append('manifest', JSON.stringify(manifest));

  try {
    const response = await axios({
      url: apiUrl,
      method: 'post',
      headers: {
        ...HEADERS,
        'Content-Type': 'multipart/form-data',
      },
      data: formData
    });
    if (response.status !== 202) {
      logger.child({ errorObj: e }).error("Image insert is failed");
    }
    logger.info(`API SUCCESS : ${JSON.stringify(response.data)}`);
    fs.renameSync(filePath, `./uploaded/${fileName}`);
    return { file: fileName, status: response.status, data: response.data };
  } catch (error) {
    logger.info(`Error in API - ${error}`);
    logger.info(error)
    return { file: fileName, error: error.message };
  }
};


// Define function to handle rate limit by delaying each request
const withRateLimit = (fn) => {
  let lastRequestTime = 0;

  return async (...args) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const timeToWait = requestInterval - timeSinceLastRequest;

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    lastRequestTime = Date.now();

    return fn(...args);
  };
};


// Define function to upload all files in a directory and save responses to a JSON file
const uploadAllFiles = async (dirPath) => {
  const fileNames = fs.readdirSync(dirPath);
  const responses = [];

  const uploadFileWithRateLimit = withRateLimit(uploadFile);

  for (const fileName of fileNames) {
    const filePath = `${dirPath}/${fileName}`;
    console.log(filePath);
    const response = await uploadFileWithRateLimit(filePath);
    responses.push(response);
  }

  const json = JSON.stringify(responses, null, 2);
  fs.writeFileSync('responses.json', json);

  return responses;
};

//Construct the otmm hash values for uploaded images
const constructHashingData = async () => {
  const images = JSON.parse(fs.readFileSync('./responses.json', 'utf8'));
  const hashData = [];
  let i = 0;
  const makeRequest = async () => {
    try {
      const response = await axios({
        url: `${process.env.JOB_STATUS}/${images[i].data.job_handle.job_id}/assets`,
        method: 'get',
        headers: {
          ...HEADERS
        }
      });
      if (response.status !== 200) {
        logger.child({ errorObj: e }).error("Get job status is failed");
      }
      logger.info(`API SUCCESS, GET JOB STATUS : ${images[i].file}`);
      const assestData = {
        id: response.data?.assets_resource?.asset_list[0]?.asset_id,
        name: response.data?.assets_resource?.asset_list[0]?.name,
        wpid: images[i].file.split('_').shift(),
        mime_type: response.data?.assets_resource?.asset_list[0]?.master_content_info?.mime_type,
        url: response.data?.assets_resource?.asset_list[0]?.delivery_service_url,
        content_type: response.data?.assets_resource?.asset_list[0]?.content_type
      }
      hashData.push(assestData);

    } catch (e) {
      logger.info(`Error in API ${images[i].file} - ${e}`);
      logger.info(e.response.data)
      hashData.push({
        wpid: images[i].file.split('_').shift(),
        error: e.message,
        status: e.response.status
      });
    }
    i++;
    if (i < images.length) {
      setTimeout(makeRequest, rateLimit);
    } else {
      logger.info("Job status querying is completed");
      const json = JSON.stringify(hashData, null, 2);
      fs.writeFileSync('images_otmm.json', json);
    }
  };
  makeRequest();
}

// Call the uploadAllFiles function with the path to the directory containing the images to upload
// uploadAllFiles('./images')
//   .then((responses) => console.log(`No of images were added: ${responses.length}`))
//   .catch((error) => console.error(error));


constructHashingData();
