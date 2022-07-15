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
var import_json_bigint = __toESM(require("json-bigint"));
var import_IotexService = require("./services/IotexService");
var import_nanospinner = require("nanospinner");
var import_fs = require("fs");
const supportedChains = {
  iotex: ["actions"],
  helium: ["blocks"],
  accumulate: ["transactions"]
};
const S3_BUCKET = "s3://casimir-etl-event-bucket-dev/";
const usage = `
${import_picocolors.default.bold("Usage:")}
    parma [chain] [command] [flags]

${import_picocolors.default.bold("Chains:")}
    iotex   Crawl iotex blockchain
    helium  Crawl helium blockchain
    
${import_picocolors.default.bold("Commands:")}
    actions Crawl actions
    blocks Crawl blocks
    
${import_picocolors.default.bold("Flags:")}
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
    -c    --count         Count of things to crawl
    -o    --output        Location to save the output
  
${import_picocolors.default.bold("Example:")} 
    parma iotex actions --net testnet # crawl iotex actions from testnet
    parma helium blocks --output --output s3://superbucket/chain1/file.json # crawl helium blocks and save the result to s3
`;
const args = (0, import_arg.default)({
  "--help": Boolean,
  "--version": Boolean,
  "--net": String,
  "--count": Number,
  "--output": String,
  "-h": "--help",
  "-v": "--version",
  "-n": "--net",
  "-c": "--count",
  "-o": "--output"
});
async function run(args2) {
  if (args2["--version"] !== void 0) {
    console.log("v1.0.0");
    process.exit(0);
  }
  if (args2["--help"] !== void 0) {
    console.log(usage);
    process.exit(0);
  }
  if (args2._.length === 0) {
    console.log(usage);
    process.exit(0);
  }
  if (args2._.length !== 2) {
    console.error(`${import_picocolors.default.red("Error:")} You must specify an action: e.g. ${import_picocolors.default.bold("parma iotex actions")}`);
    process.exit(1);
  }
  if (supportedChains[args2._[0]] === void 0) {
    console.error(import_picocolors.default.red("Error:"), `Unsupported chain ${args2._[0]}. Supported chains: ${import_picocolors.default.bold(Object.keys(supportedChains).join(", "))}`);
    process.exit(1);
  }
  const config = {
    chain: args2._[0],
    command: args2._[1],
    output: S3_BUCKET,
    network: null,
    option: {}
  };
  if (args2["--net"] !== void 0) {
    config.network = args2["--net"];
  }
  if (args2["--output"] !== void 0) {
    config.output = args2["--output"];
  }
  if (config.chain === "iotex") {
    if (config.network === void 0) {
      console.log(import_picocolors.default.yellow("Warning:"), "No network specified, using mainnet");
      config.network = import_IotexService.IotexNetworkType.Mainnet;
    }
    const service = await (0, import_IotexService.newIoTexService)();
    if (args2._[1] === "actions") {
      const meta = await service.getChainMetadata();
      const height = parseInt(meta.chainMeta.height);
      const trips = Math.ceil(height / 1e3);
      const spinner = (0, import_nanospinner.createSpinner)("Crawling... \n").start();
      const writeStream = (0, import_fs.createWriteStream)("./events.json", {
        flags: "a+"
      });
      for (let i = 0; i < trips; i++) {
        spinner.update({
          text: `Crawling ${i + 1}/${trips}`
        });
        const from = height - i * 1e3;
        const actions = await service.getCreateStakeActionsByIndex(from, 1e3);
        if (actions.length === 0) {
          continue;
        }
        const ndjson = actions.map((action) => import_json_bigint.default.stringify(action) + "\n");
        writeStream.write(ndjson.join(""));
      }
    }
  }
}
process.on("unhandledRejection", (reason) => {
  console.log(reason);
  process.exit(1);
});
run(args).catch((err) => {
  if (err.code === "ARG_UNKNOWN_OPTION") {
    const errMsg = err.message.split("\n");
    console.log(`${import_picocolors.default.red("Error: ")} ${errMsg}, see ${import_picocolors.default.bold("crawlerr --help")}`);
    process.exit(1);
  }
  console.log(err);
  process.exit(1);
});
