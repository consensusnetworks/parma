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
  async start() {
    if (this.running) {
      throw new Error("Crawler is already running");
    }
    if (this.service == null) {
      throw new Error("Crawler is not initialized");
    }
    this.running = true;
    if (this.service instanceof import_IotexService.IoTexService) {
      const meta = await this.service.getChainMetadata();
      const height = parseInt(meta.chainMeta.height);
      const trips = Math.ceil(height / 1e3);
      const spinner = (0, import_nanospinner.createSpinner)("Crawling... \n").start();
      for (let i = 0; i < trips; i++) {
        spinner.update({ text: `Crawling... ${i}/${trips} 
` });
        const data = await this.service.getBlockMetasByIndex(i * 1e3, 1e3);
        import_node_fs.default.appendFileSync(this.config.output, import_json_bigint.default.stringify(data));
      }
      spinner.stop();
      return;
    }
    throw new Error();
  }
}
async function crawler(config) {
  const c = new Crawler({
    chain: (config == null ? void 0 : config.chain) ?? "iotex" /* Iotex */,
    output: config.output,
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
