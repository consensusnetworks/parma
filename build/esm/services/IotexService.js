import Antenna from "iotex-antenna";
import { from } from "@iotexproject/iotex-address-ts";
var IotexNetworkType = /* @__PURE__ */ ((IotexNetworkType2) => {
  IotexNetworkType2["Mainnet"] = "mainnet";
  IotexNetworkType2["Testnet"] = "testnet";
  return IotexNetworkType2;
})(IotexNetworkType || {});
class IoTexService {
  constructor(opt) {
    this.network = "mainnet" /* Mainnet */;
    this.endpoint = this.network === "mainnet" /* Mainnet */ ? "https://api.iotex.one:443" : "https://api.testnet.iotex.one:443";
    this.client = new Antenna(this.endpoint);
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
  async getServerMeta() {
    const meta = await this.client.iotx.getServerMeta({});
    console.log(meta);
  }
  async getBlocksByIndex(start, count) {
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
      var _a;
      return (_a = b.action.core) == null ? void 0 : _a.grantReward;
    });
    if (grantReward.length === 0 || grantReward === void 0) {
      throw new Error("Failed to get grantReward");
    }
    console.log(JSON.stringify(grantReward[0], null, 2));
    return {};
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
        address: b.action.senderPubKey,
        staked_candidate: (_k = (_j = b.action.core) == null ? void 0 : _j.stakeCreate) == null ? void 0 : _k.candidateName,
        staked_amount: parseInt((_m = (_l = b.action.core) == null ? void 0 : _l.stakeCreate) == null ? void 0 : _m.stakedAmount),
        staked_duration: (_o = (_n = b.action.core) == null ? void 0 : _n.stakeCreate) == null ? void 0 : _o.stakedDuration,
        auto_stake: (_q = (_p = b.action.core) == null ? void 0 : _p.stakeCreate) == null ? void 0 : _q.autoStake
      };
    });
    return filtered;
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
    const add = from(eth);
    return add.string();
  }
  convertIotxToEth(iotx) {
    const add = from(iotx);
    return add.stringEth();
  }
}
async function newIotexService(opt) {
  return new IoTexService({
    network: "mainnet" /* Mainnet */
  });
}
export {
  IotexNetworkType,
  newIotexService
};
