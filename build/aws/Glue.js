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
var Glue_exports = {};
__export(Glue_exports, {
  getDatabaseMetadata: () => getDatabaseMetadata,
  getDatabaseTables: () => getDatabaseTables
});
module.exports = __toCommonJS(Glue_exports);
var import_client_glue = require("@aws-sdk/client-glue");
var import_credential_provider_node = require("@aws-sdk/credential-provider-node");
async function newGlueClient(opt) {
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
  return new import_client_glue.GlueClient(opt);
}
async function getDatabaseMetadata(name) {
  if (name === "") {
    throw new Error("database name cannot be empty");
  }
  const glue = await newGlueClient({});
  const database = new import_client_glue.GetDatabaseCommand({
    Name: name
  });
  const result = await glue.send(database);
  if (result.$metadata.httpStatusCode !== 200) {
    if (result.$metadata.httpStatusCode === 400) {
      throw new Error("Database not found");
    }
    throw new Error("Failed to retrieve database metadata");
  }
  if (result.Database === void 0) {
    throw new Error("Failed to retrieve database metadata");
  }
  if (result.Database.Name === void 0 || result.Database.CatalogId === void 0) {
    throw new Error("Failed to retrieve database metadata");
  }
  return {
    Name: result.Database.Name,
    Description: result.Database.Description,
    CatalogId: result.Database.CatalogId
  };
}
async function getDatabaseTables(name) {
  if (name === "") {
    throw new Error("Database name cannot be empty");
  }
  const glue = await newGlueClient({});
  const database = new import_client_glue.GetTablesCommand({
    DatabaseName: name
  });
  const result = await glue.send(database);
  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error("Failed to retrieve database tables");
  }
  if (result.TableList === void 0) {
    throw new Error("Failed to retrieve database tables");
  }
  return result.TableList;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDatabaseMetadata,
  getDatabaseTables
});
