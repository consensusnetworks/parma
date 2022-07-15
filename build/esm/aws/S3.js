import { S3Client } from "@aws-sdk/client-s3";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Upload } from "@aws-sdk/lib-storage";
async function uploadToS3(data, destination) {
  if (!destination.startsWith("s3://")) {
    throw new Error("Invalid destination");
  }
  const [bucket, ...keys] = destination.split(":/")[1].split("/").splice(1);
  if (bucket === "")
    throw new Error("bucket name cannot be empty");
  if (keys.length === 0) {
    throw new Error("path cannot be empty");
  }
  try {
    const s3Client = await newS3Client();
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: keys.join("/"),
        Body: data
      },
      leavePartsOnError: true
    });
    upload.on("httpUploadProgress", (progess) => {
      console.log(`Uploading ${progess.loaded}/${progess.total}`);
    });
    await upload.done();
  } catch (err) {
    throw new Error("Unable to upload to S3");
  }
}
async function newS3Client(opt) {
  if ((opt == null ? void 0 : opt.region) === void 0) {
    opt = {
      region: "us-east-2"
    };
  }
  if (opt.credentials === void 0) {
    opt = {
      credentials: await defaultProvider()
    };
  }
  const client = new S3Client(opt);
  return client;
}
export {
  newS3Client,
  uploadToS3
};
