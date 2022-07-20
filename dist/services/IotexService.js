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
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var IotexService_exports = {};
__export(IotexService_exports, {
  IoTexService: () => IoTexService,
  IotexNetworkType: () => IotexNetworkType,
  newIotexService: () => newIotexService
});
module.exports = __toCommonJS(IotexService_exports);
var import_iotex_antenna = __toESM(require("iotex-antenna"));
var import_iotex_address_ts = require("@iotexproject/iotex-address-ts");
var IotexNetworkType = /* @__PURE__ */ ((IotexNetworkType2) => {
  IotexNetworkType2["Mainnet"] = "mainnet";
  IotexNetworkType2["Testnet"] = "testnet";
  return IotexNetworkType2;
})(IotexNetworkType || {});
class IoTexService {
  constructor(opt) {
    this.network = "mainnet" /* Mainnet */;
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
    const metas = await this.client.iotx.getBlockMetas({ byIndex: { start, count } });
    return metas;
  }
  async getBlockMetaByHash(hash) {
    const metas = await this.client.iotx.getBlockMetas({
      byHash: {
        blkHash: hash
      }
    });
    return metas;
  }
  async getBlockLogs(hash) {
    const s = await this.client.iotx.getLogs({
      filter: {
        address: [],
        topics: []
      },
      byBlock: {
        blockHash: Buffer.from(hash, "hex")
      }
    });
    return s;
  }
  async streamBlocks() {
    const stream = await this.client.iotx.streamBlocks({});
    return stream;
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
  async getServerMeta() {
    const meta = await this.client.iotx.getServerMeta({});
    return meta;
  }
  async testme(start, count) {
    const c = await this.client.iotx.getBlockMetas({
      byIndex: {
        start,
        count
      }
    });
    return c;
  }
  async getAllGovernanceActions(start, count) {
    const actions = await this.getActionsByIndex(start, count);
    if (actions.length === 0) {
      throw new Error("Failed to get actions");
    }
    const grantReward = actions.filter((b) => {
      var _a;
      return ((_a = b.action.core) == null ? void 0 : _a.grantReward) != null;
    }).map((b) => {
      b.action.senderPubKey = Buffer.from(b.action.senderPubKey).toString("hex");
      b.action.signature = Buffer.from(b.action.signature).toString("hex");
      console.log(b.blkHash);
      return b;
    });
    if (grantReward.length === 0 || grantReward === void 0) {
      throw new Error("Failed to get grantReward");
    }
    return {
      grantReward
    };
  }
  async getCreateStakeActionsByIndex(start, count) {
    const actions = await this.getActionsByIndex(start, count);
    if (actions.length === 0) {
      throw new Error("Failed to get actions");
    }
    const filtered = actions.filter((b) => {
      var _a;
      return ((_a = b.action.core) == null ? void 0 : _a.stakeCreate) != null;
    }).map((b) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      if (((_b = (_a = b.action.core) == null ? void 0 : _a.stakeCreate) == null ? void 0 : _b.payload) != null) {
        b.action.core.stakeCreate.payload = b.action.core.stakeCreate.payload.toString();
      }
      if (((_c = b.action.core) == null ? void 0 : _c.execution) != null) {
        b.action.core.execution.data = Buffer.from(b.action.core.execution.data.slice(2)).toString("hex");
      }
      b.action.senderPubKey = Buffer.from(b.action.senderPubKey).toString("hex");
      b.action.signature = Buffer.from(b.action.signature).toString("hex");
      if (((_e = (_d = b.action.core) == null ? void 0 : _d.stakeCreate) == null ? void 0 : _e.stakedAmount) === void 0 || ((_g = (_f = b.action.core) == null ? void 0 : _f.stakeCreate) == null ? void 0 : _g.stakedDuration) === void 0 || ((_i = (_h = b.action.core) == null ? void 0 : _h.stakeCreate) == null ? void 0 : _i.autoStake) === void 0) {
        throw new Error("Failed to get actions");
      }
      return {
        type: "create_stake",
        datestring: new Date(b.timestamp.seconds * 1e3).toISOString().split("T")[0],
        address: "",
        staked_candidate: (_k = (_j = b.action.core) == null ? void 0 : _j.stakeCreate) == null ? void 0 : _k.candidateName,
        staked_amount: parseInt((_m = (_l = b.action.core) == null ? void 0 : _l.stakeCreate) == null ? void 0 : _m.stakedAmount),
        staked_duration: (_o = (_n = b.action.core) == null ? void 0 : _n.stakeCreate) == null ? void 0 : _o.stakedDuration,
        auto_stake: (_q = (_p = b.action.core) == null ? void 0 : _p.stakeCreate) == null ? void 0 : _q.autoStake
      };
    });
    return filtered;
  }
  async getActionsByBlockHash(hash) {
    const actions = await this.client.iotx.getActions({
      byHash: {
        actionHash: hash,
        checkPending: true
      }
    });
    return actions.actionInfo;
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
    if (actions.actionInfo == null) {
      throw new Error("Failed to get actions");
    }
    return actions.actionInfo;
  }
  async getGasPrice() {
    const { gasPrice } = await this.client.iotx.suggestGasPrice({});
    return gasPrice;
  }
  convertEthToIotx(eth) {
    const add = (0, import_iotex_address_ts.from)(eth);
    return add.string();
  }
  convertIotxToEth(iotx) {
    const add = (0, import_iotex_address_ts.from)(iotx);
    return add.stringEth();
  }
}
async function newIotexService(opt) {
  return new IoTexService({
    network: (opt == null ? void 0 : opt.network) ?? "mainnet" /* Mainnet */
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IoTexService,
  IotexNetworkType,
  newIotexService
});
