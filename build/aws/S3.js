"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var S3_exports = {};
__export(S3_exports, {
  uploadToS3: () => uploadToS3
});
module.exports = __toCommonJS(S3_exports);
var import_client_s3 = require("@aws-sdk/client-s3");
var import_credential_provider_node = require("@aws-sdk/credential-provider-node");
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
  const upload = new import_client_s3.PutObjectCommand({
    Bucket: bucket,
    Key: keys.join("/"),
    Body: data
  });
  const client = await s3Client({});
  await client.send(upload).catch((err) => {
    throw new Error(err);
  });
}
async function s3Client(opt) {
  if (opt.region === void 0) {
    opt = {
      region: "us-east-2"
    };
  }
  if (opt.credentials === void 0) {
    opt = {
      credentials: await (0, import_credential_provider_node.defaultProvider)()
    };
  }
  const client = new import_client_s3.S3Client(opt);
  return client;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  uploadToS3
});
