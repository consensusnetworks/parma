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
var Athena_exports = {};
__export(Athena_exports, {
  newAthenaClient: () => newAthenaClient
});
module.exports = __toCommonJS(Athena_exports);
var import_client_athena = require("@aws-sdk/client-athena");
var import_credential_provider_node = require("@aws-sdk/credential-provider-node");
async function newAthenaClient(opt) {
  if (opt.credentials === void 0) {
    opt = {
      credentials: await (0, import_credential_provider_node.defaultProvider)()
    };
  }
  const client = new import_client_athena.AthenaClient(opt);
  return client;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  newAthenaClient
});
