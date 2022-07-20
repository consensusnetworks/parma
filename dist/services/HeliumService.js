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
var HeliumService_exports = {};
__export(HeliumService_exports, {
  HeliumNetworkType: () => HeliumNetworkType,
  newHeliumService: () => newHeliumService
});
module.exports = __toCommonJS(HeliumService_exports);
var import_http = require("@helium/http");
var HeliumNetworkType = /* @__PURE__ */ ((HeliumNetworkType2) => {
  HeliumNetworkType2["Production"] = "production";
  HeliumNetworkType2["Staging"] = "staging";
  return HeliumNetworkType2;
})(HeliumNetworkType || {});
class HeliumService {
  constructor(opt) {
    this.network = opt.network;
    this.client = new import_http.Client(this.network === "production" /* Production */ ? import_http.Network.production : import_http.Network.staging);
  }
  async getBlocksByHeight(height) {
    if (height < 0) {
      throw new Error("height must be greater than 0");
    }
    if (height === 0) {
      height = 1;
    }
    const blocks = await this.client.blocks.get(height);
    const g = await this.client.stats.get();
    console.log(g);
    return blocks;
  }
}
async function newHeliumService(opt) {
  if (opt.network === void 0) {
    opt.network = "staging" /* Staging */;
  }
  return new HeliumService(opt);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HeliumNetworkType,
  newHeliumService
});
