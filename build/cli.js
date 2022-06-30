#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var import_arg = __toESM(require("arg"));
var import_promises = __toESM(require("fs/promises"));
var import_picocolors = __toESM(require("picocolors"));
var import_IotexService = require("./services/IotexService");
const supportedChains = {
  iotex: ["actions"]
};
const usage = `
${import_picocolors.default.bold("Usage:")}
    crawlerr [chain] [command] [flags]
${import_picocolors.default.bold("Chains:")}
    iotex   Crawl iotex

${import_picocolors.default.bold("Commands:")}
    actions Crawl actions
    blocks Crawl blocks
    
${import_picocolors.default.bold("Flags:")}
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
  
${import_picocolors.default.bold("Example:")} 
    crawlerr iotex actions --net testnet
`;
const args = (0, import_arg.default)({
  "--help": Boolean,
  "--version": Boolean,
  "--net": String,
  "-h": "--help",
  "-v": "--version",
  "-n": "--net"
});
async function run(args2) {
  if (supportedChains[args2._[0]] === void 0) {
    console.error(import_picocolors.default.red("Error:"), "You must specifiy a chain and action");
    return;
  }
  if (args2._.length !== 2) {
    print(`${import_picocolors.default.red("Error:")} You must specify an action: e.g. ${import_picocolors.default.bold("crawlerr iotex actions")}`);
    process.exit(1);
  }
  if (args2["--help"] !== void 0) {
    print(usage);
    process.exit(0);
  }
  if (args2["--version"] !== void 0) {
    print("v1.0.0");
    process.exit(0);
  }
  if (args2._.length === 0) {
    print(usage);
    process.exit(0);
  }
  const options = {
    chain: args2._[0],
    network: import_IotexService.Network.Mainnet
  };
  if (args2["--net"] !== void 0) {
    options.network = args2["--net"];
  }
  if (args2._[0] === "iotex") {
    const service = await (0, import_IotexService.newIoTexService)({
      network: options.network,
      endpoint: "https://api.testnet.iotex.one:443"
    });
    if (args2._[1] === "actions") {
      const actions = await service.getActionsByIndex(1, 1e3);
      await import_promises.default.writeFile("./actions.json", JSON.stringify(actions, null, 2), "utf8").catch((err) => {
        print(err);
        process.exit(1);
      });
      process.exit(0);
    }
    if (args2._[1] === "blocks") {
      const blocks = await service.getBlockMetasByIndex(1, 1e3);
      await import_promises.default.writeFile("./blocks.json", JSON.stringify(blocks, null, 2), "utf8").catch((err) => {
        print(err);
        process.exit(1);
      });
      process.exit(0);
    }
    print(`${import_picocolors.default.red("Error:")} You must specify an action: e.g. ${import_picocolors.default.bold("crawlerr iotex actions")}`);
  }
  process.exit(0);
}
run(args).catch((err) => {
  if (err.code === "ARG_UNKNOWN_OPTION") {
    const errMsg = err.message.split("\n");
    print(`${import_picocolors.default.red("Error: ")} ${errMsg}, see ${import_picocolors.default.bold("crawlerr --help")}`);
    process.exit(1);
  }
  print(err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  print(reason);
  process.exit(1);
});
function print(msg) {
  typeof msg === "string" ? process.stdout.write(`${msg} 
`) : process.stdout.write(`${JSON.stringify(msg, null, 2)} 
`);
}
