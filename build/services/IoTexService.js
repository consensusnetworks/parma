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
  IotexNetworkType: () => IotexNetworkType,
  newIoTexService: () => newIoTexService
});
module.exports = __toCommonJS(IoTexService_exports);
var import_iotex_antenna = __toESM(require("iotex-antenna"));
var IotexNetworkType = /* @__PURE__ */ ((IotexNetworkType2) => {
  IotexNetworkType2["Mainnet"] = "mainnet";
  IotexNetworkType2["Testnet"] = "testnet";
  return IotexNetworkType2;
})(IotexNetworkType || {});
class IoTexService {
  constructor(opt) {
    this.network = opt.network;
    this.endpoint = this.network === "mainnet" /* Mainnet */ ? "https://api.iotex.one:443" : "https://api.testnet.iotex.one:443";
    this.client = new import_iotex_antenna.default(this.endpoint);
  }
  async getChainMetadata() {
    const meta = await this.client.iotx.getChainMeta({});
    return meta;
  }
  async getActionByHash(hash) {
    const action = await this.client.iotx.getActions({
      byHash: {
        actionHash: hash,
        checkPending: true
      }
    });
    return action;
  }
  async getBlockMetasByIndex(start, count) {
    if (start < 0 || count < 0) {
      throw new Error("start and count must be greater than 0");
    }
    if (start === 0) {
      start = 1;
    }
    if (count === 0) {
      count = 100;
    }
    const metas = await this.client.iotx.getBlockMetas({ byIndex: { start: count, count } });
    return metas;
  }
  async getAccountActions(address) {
    const account = await this.client.iotx.getAccount({
      address
    });
    if (account.accountMeta == null) {
      return [];
    }
    const actions = await this.client.iotx.getActions({
      byAddr: {
        address: account.accountMeta.address,
        start: 1,
        count: 10
      }
    });
    return actions;
  }
  async getActionsByIndex(start, count) {
    if (start < 0 || count < 0) {
      throw new Error("start and count must be greater than 0");
    }
    if (count === 0) {
      count = 100;
    }
    if (start === 0) {
      start = 1;
    }
    const actions = await this.client.iotx.getActions({
      byIndex: {
        start,
        count
      }
    });
    actions.actionInfo.forEach((info) => {
      var _a;
      if (((_a = info.action.core) == null ? void 0 : _a.execution) != null) {
        info.action.core.execution.data = Buffer.from(info.action.core.execution.data.slice(2)).toString("hex");
      }
      info.action.senderPubKey = Buffer.from(info.action.senderPubKey).toString("hex");
      info.action.signature = Buffer.from(info.action.signature).toString("hex");
    });
    return actions;
  }
  async getGasPrice() {
    const { gasPrice } = await this.client.iotx.suggestGasPrice({});
    return gasPrice;
  }
}
async function newIoTexService(opt) {
  if (opt.network === void 0) {
    opt.network = "mainnet" /* Mainnet */;
  }
  return new IoTexService(opt);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IotexNetworkType,
  newIoTexService
});
