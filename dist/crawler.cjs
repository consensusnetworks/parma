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
var Crawler_exports = {};
__export(Crawler_exports, {
  Chain: () => Chain,
  crawler: () => crawler
});
module.exports = __toCommonJS(Crawler_exports);
var import_IotexService = require("./services/IotexService");
var import_events = __toESM(require("events"));
var import_nanospinner = require("nanospinner");
var import_json_bigint = __toESM(require("json-bigint"));
var import_node_fs = __toESM(require("node:fs"));
var Chain = /* @__PURE__ */ ((Chain2) => {
  Chain2["Iotex"] = "iotex";
  Chain2["Accumulate"] = "accumulate";
  return Chain2;
})(Chain || {});
const sp = (0, import_nanospinner.createSpinner)();
const EE = new import_events.default();
class Crawler {
  constructor(config) {
    this.config = config;
    this.init = new Date();
    this.service = null;
    this.running = false;
    this.EE = EE;
  }
  async _init() {
    if (this.config.chain === "iotex" /* Iotex */) {
      const service = await (0, import_IotexService.newIotexService)();
      this.service = service;
      import_node_fs.default.openSync(this.config.output, "w");
      if (this.config.verbose) {
        this.EE.on("init", () => {
          console.log(`Initialized crawler for: ${this.config.chain}`);
        });
      }
      this.EE.emit("init");
      return;
    }
    throw new Error("Unknown chain");
  }
  isReadbleFile(file) {
    return import_node_fs.default.existsSync(file) && import_node_fs.default.statSync(file).isFile();
  }
  async start() {
    if (this.running) {
      throw new Error("Crawler is already running");
    }
    if (this.service == null) {
      throw new Error("Crawler is not initialized");
    }
    this.running = true;
    if (this.service instanceof import_IotexService.IoTexService) {
      const a = await this.service.getAllGovernanceActions(12e6, 1e3);
      console.log(import_json_bigint.default.stringify(a == null ? void 0 : a.grantReward[0], null, 2));
      const block = await this.service.getBlockMetaByHash("edfe9e7cb3e006e0c0841438de6dfefcdcbfd0e1ffcf91e5bad30879cfa65b99");
      console.log(import_json_bigint.default.stringify(block, null, 2));
      console.log(import_json_bigint.default.stringify({
        type: "grant_reward",
        datestring: new Date(block.blkMetas[0].timestamp.seconds * 1e3).toISOString().split("T")[0],
        transfer_amount: block.blkMetas[0].transferAmount,
        address: block.blkMetas[0].producerAddress
      }, null, 2));
      return;
    }
    throw new Error("Unrecognized service type");
  }
}
async function crawler(config) {
  const c = new Crawler({
    chain: (config == null ? void 0 : config.chain) ?? "iotex" /* Iotex */,
    output: config.output ?? "./output.json",
    verbose: config.verbose ?? false
  });
  await c._init();
  return c;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Chain,
  crawler
});
