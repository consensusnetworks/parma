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
var import_picocolors = __toESM(require("picocolors"));
var import_IotexService = require("./services/IotexService");
const usage = `
${import_picocolors.default.bold("Usage:")}
    crawlerr [commands] [arg] [flags]
${import_picocolors.default.bold("Commands:")}
    crawl   Crawls the specified chain
${import_picocolors.default.bold("Flags:")}
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
  
${import_picocolors.default.bold("Example:")} 
    crawlerr --net testnet
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
    network: import_IotexService.Network.Testnet
  };
  if (args2["--net"] !== void 0) {
    options.network = args2["--net"];
  }
  if (args2._[0] === "crawl") {
    const service = await (0, import_IotexService.newIoTexService)(options.network);
    const meta = await service.getChainMetadata();
    const actions = await service.getActions();
    print(meta);
    print(actions);
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
