#!/usr/bin/env node
import arg from "arg";
import pc from "picocolors";
import JSONbig from "json-bigint";
import { newIoTexService, IotexNetworkType } from "./services/IotexService";
import { createSpinner } from "nanospinner";
import { createWriteStream } from "fs";
const supportedChains = {
  iotex: ["actions"],
  helium: ["blocks"],
  accumulate: ["transactions"]
};
const S3_BUCKET = "s3://casimir-etl-event-bucket-dev/";
const usage = `
${pc.bold("Usage:")}
    parma [chain] [command] [flags]

${pc.bold("Chains:")}
    iotex   Crawl iotex blockchain
    helium  Crawl helium blockchain
    
${pc.bold("Commands:")}
    actions Crawl actions
    blocks Crawl blocks
    
${pc.bold("Flags:")}
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
    -c    --count         Count of things to crawl
    -o    --output        Location to save the output
  
${pc.bold("Example:")} 
    parma iotex actions --net testnet # crawl iotex actions from testnet
    parma helium blocks --output --output s3://superbucket/chain1/file.json # crawl helium blocks and save the result to s3
`;
const args = arg({
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
    console.error(`${pc.red("Error:")} You must specify an action: e.g. ${pc.bold("parma iotex actions")}`);
    process.exit(1);
  }
  if (supportedChains[args2._[0]] === void 0) {
    console.error(pc.red("Error:"), `Unsupported chain ${args2._[0]}. Supported chains: ${pc.bold(Object.keys(supportedChains).join(", "))}`);
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
      console.log(pc.yellow("Warning:"), "No network specified, using mainnet");
      config.network = IotexNetworkType.Mainnet;
    }
    const service = await newIoTexService();
    if (args2._[1] === "actions") {
      const meta = await service.getChainMetadata();
      const height = parseInt(meta.chainMeta.height);
      const trips = Math.ceil(height / 1e3);
      const spinner = createSpinner("Crawling... \n").start();
      const writeStream = createWriteStream("./events.json", {
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
        const ndjson = actions.map((action) => JSONbig.stringify(action) + "\n");
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
    console.log(`${pc.red("Error: ")} ${errMsg}, see ${pc.bold("crawlerr --help")}`);
    process.exit(1);
  }
  console.log(err);
  process.exit(1);
});
