"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var IoTexService_exports = {};
__export(IoTexService_exports, {
  Network: () => Network,
  newIoTexService: () => newIoTexService
});
module.exports = __toCommonJS(IoTexService_exports);
var import_iotex_antenna = __toESM(require("iotex-antenna"));
var Network = /* @__PURE__ */ ((Network2) => {
  Network2["Mainnet"] = "mainnet";
  Network2["Testnet"] = "testnet";
  return Network2;
})(Network || {});
class IoTexService {
  constructor(network) {
    this.network = network;
    this.endpoint = "https://api.iotex.one:443";
    this.client = new import_iotex_antenna.default(this.endpoint);
  }
  async getChainMetadata() {
    const meta = await this.client.iotx.getChainMeta({});
    return meta;
  }
  async getActions() {
    const actions = await this.client.iotx.getActions({});
    return actions;
  }
  async getGasPrice() {
    const { gasPrice } = await this.client.iotx.suggestGasPrice({});
    return gasPrice;
  }
}
async function newIoTexService(network) {
  if (network === void 0) {
    network = "mainnet" /* Mainnet */;
  }
  return new IoTexService(network);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Network,
  newIoTexService
});
