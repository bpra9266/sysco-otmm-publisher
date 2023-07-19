const API_KEY = process.env.API_KEY;

export const HEADERS = {
    'X-Requested-By': API_KEY,
    'Cookie': 'JSESSIONID=CB19EE24E1BA063846F9A332A27506F9.otmm1;AWSALB=LKiJzguJ5TSm3lm3EDIqwAHHOEWkLzq6QQ3d7ofZmGDMOzipWRARW2efe%2FXi8aohbj4ByKuKkphb91kWk4Tthl8a1%2Fmzp%2FZ2jXtxvqHHdTOlGdyGb0lYZxueEn4G;AWSALBCORS=LKiJzguJ5TSm3lm3EDIqwAHHOEWkLzq6QQ3d7ofZmGDMOzipWRARW2efe%2FXi8aohbj4ByKuKkphb91kWk4Tthl8a1%2Fmzp%2FZ2jXtxvqHHdTOlGdyGb0lYZxueEn4G',
   //  'otmmauthtoken': '018a1ff1973c7ea855be8fa0b9973c935ad008f8',
   //  'Cookie': 'JSESSIONID=2C13A0D724E0CF1CF26BF06CDE4B2969;BIGipServerpool_dev_creativestudio dev.sysco.com_443=1152943370.47873.0000;'
};


export const ASSET_REPRESENTATION = {
    "asset_resource":{
       "asset":{
          "metadata":{
             "metadata_element_list":[             
             ]
          },
          "metadata_model_id":"SYSCO.MODEL.CONTENTSTACK",
          "security_policy_list":[
             {
                "id":79
             }
          ]
       }
    }
 }

 export const MANIFEST = {
    "upload_manifest":{
       "master_files":[
          {
             "file":{
                "file_name":"IMG_3674.jpg",
                "file_type":"image/jpeg"
             }
          }
       ]
    }
 }