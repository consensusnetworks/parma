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
var AccumulateService_exports = {};
__export(AccumulateService_exports, {
  AccumulateNetworkType: () => AccumulateNetworkType,
  newAccumulateService: () => newAccumulateService
});
module.exports = __toCommonJS(AccumulateService_exports);
var import_accumulate = require("accumulate.js");
var AccumulateNetworkType = /* @__PURE__ */ ((AccumulateNetworkType2) => {
  AccumulateNetworkType2["Mainnet"] = "mainnet";
  AccumulateNetworkType2["Testnet"] = "testnet";
  return AccumulateNetworkType2;
})(AccumulateNetworkType || {});
class AccumulateService {
  constructor(opt) {
    this.network = opt.network;
    this.client = new import_accumulate.Client(this.network === "mainnet" /* Mainnet */ ? "https://testnet.accumulatenetwork.io/v2" : "https://testnet.accumulatenetwork.io/v2");
  }
}
async function newAccumulateService(opt) {
  return new AccumulateService(opt);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccumulateNetworkType,
  newAccumulateService
});
