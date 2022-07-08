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
var import_HeliumService = require("./services/HeliumService");
var import_AccumulateService = require("./services/AccumulateService");
var import_S3 = require("./aws/S3");
var import_nanospinner = require("nanospinner");
var import_fs = require("fs");
var import_json_bigint = __toESM(require("json-bigint"));
const supportedChains = {
  iotex: ["actions"],
  helium: ["blocks"],
  accumulate: ["transactions"]
};
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
    console.error(`${import_picocolors.default.red("Error:")} You must specify an action: e.g. ${import_picocolors.default.bold("crawlerr iotex actions")}`);
    process.exit(1);
  }
  if (supportedChains[args2._[0]] === void 0) {
    console.error(import_picocolors.default.red("Error:"), `Unsupported chain ${args2._[0]}. Supported chains: ${import_picocolors.default.bold(Object.keys(supportedChains).join(", "))}`);
    process.exit(1);
  }
  const options = {
    chain: args2._[0],
    network: args2["--net"],
    command: args2._[1],
    output: args2["--output"],
    option: {}
  };
  if (supportedChains[options.chain] === null) {
    console.error(import_picocolors.default.red("Error:"), `Unsupported chain ${options.chain}`);
    process.exit(1);
  }
  if (options.output === void 0) {
    options.output = process.cwd() + "/output.json";
    console.log(import_picocolors.default.yellow("Warning:"), `No output specified. Using ${options.output}`);
  }
  if (options.chain === "iotex") {
    if (options.network === void 0) {
      console.log(import_picocolors.default.yellow("Warning:"), "No network specified, using mainnet");
      options.network = import_IotexService.IotexNetworkType.Mainnet;
    }
    const service = await (0, import_IotexService.newIoTexService)({
      network: options.network
    });
    if (args2._[1] === "actions") {
      const meta = await service.getChainMetadata();
      const height = parseInt(meta.chainMeta.height);
      const trips = Math.ceil(height / 1e3);
      const stream = (0, import_fs.createWriteStream)(options.output, {
        flags: "a",
        encoding: "utf8",
        highWaterMark: 16 * 1024
      });
      const spinner = (0, import_nanospinner.createSpinner)("Crawling...").start();
      let chunk = "";
      for (let i = 0; i < trips; i++) {
        const from = height - i * 1e3;
        const actions = await service.getCreateStakeActionsByIndex(from, 1e3);
        if (actions.length === 0) {
          continue;
        }
        if (i % 5 === 0) {
          stream.write(chunk);
          stream.on("error ", (err) => {
            spinner.stop();
            console.error(import_picocolors.default.red("Error:"), err);
            process.exit(1);
          });
          stream.on("finish", () => {
            spinner.success({ text: `${import_picocolors.default.bgGreen("Done \u2713")}
` });
            stream.end();
            process.exit(0);
          });
          chunk = "";
        }
        actions.forEach((action) => {
          chunk += import_json_bigint.default.stringify(action) + "\n";
        });
      }
    }
    if (args2._[1] === "blocks") {
      const blocks = await service.getBlockMetasByIndex(1, 1e3);
      await saveOutput(JSON.stringify(blocks, null, 2), options.output);
      console.log(`${import_picocolors.default.bgGreen("Done \u2713")}`);
      process.exit(0);
    }
    console.log(`${import_picocolors.default.red("Error:")} You must specify an action: e.g. ${import_picocolors.default.bold("parma iotex actions")}`);
    process.exit(1);
  }
  if (options.chain === "helium") {
    const heliumOpt = {
      network: import_HeliumService.HeliumNetworkType.Production
    };
    const service = await (0, import_HeliumService.newHeliumService)(heliumOpt);
    if (args2._[1] === "blocks") {
      const blocks = await service.getBlocksByHeight(5);
      await saveOutput(JSON.stringify(blocks, null, 2), options.output);
      console.log(`${import_picocolors.default.bgGreen("Done \u2713")}`);
      process.exit(0);
    }
    console.log(`${import_picocolors.default.red("Error:")} You must specify an action: e.g. ${import_picocolors.default.bold("crawlerr helium blocks")}`);
    process.exit(1);
  }
  if (options.chain === "accumulate") {
    const accumulateOpt = {
      network: import_AccumulateService.AccumulateNetworkType.Testnet
    };
    if (args2._[1] === "transactions") {
      const service = await (0, import_AccumulateService.newAccumulateService)(accumulateOpt);
      console.log(service);
      console.log(`${import_picocolors.default.bgGreen("Done \u2713")}`);
      process.exit(0);
    }
    console.log(`${import_picocolors.default.red("Error:")} You must specify an action: e.g. ${import_picocolors.default.bold("crawlerr accumulate transactions")}`);
    process.exit(1);
  }
  console.log(`${import_picocolors.default.red("Error:")} You must specify a chain: e.g. ${import_picocolors.default.bold("crawlerr iotex actions")}`);
  process.exit(1);
}
async function saveOutput(data, dest) {
  if (dest.startsWith("./") || dest.startsWith("../")) {
    await import_promises.default.writeFile(dest, data, "utf8").catch((err) => {
      console.log(err);
      process.exit(1);
    });
    return;
  }
  if (dest.startsWith("s3://")) {
    await (0, import_S3.uploadToS3)(data, dest);
    return;
  }
  if (dest.startsWith("/")) {
    await import_promises.default.writeFile(dest, data, "utf8").catch((err) => {
      console.log(err);
      process.exit(1);
    });
    return;
  }
  throw new Error("Unsupported destination");
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
