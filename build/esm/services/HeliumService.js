import { Client, Network } from "@helium/http";
var HeliumNetworkType = /* @__PURE__ */ ((HeliumNetworkType2) => {
  HeliumNetworkType2["Production"] = "production";
  HeliumNetworkType2["Staging"] = "staging";
  return HeliumNetworkType2;
})(HeliumNetworkType || {});
class HeliumService {
  constructor(opt) {
    this.network = opt.network;
    this.client = new Client(this.network === "production" /* Production */ ? Network.production : Network.staging);
  }
  async getBlocksByHeight(height) {
    if (height < 0) {
      throw new Error("height must be greater than 0");
    }
    if (height === 0) {
      height = 1;
    }
    const blocks = await this.client.blocks.get(height);
    const g = await this.client.stats.get();
    console.log(g);
    return blocks;
  }
}
async function newHeliumService(opt) {
  if (opt.network === void 0) {
    opt.network = "staging" /* Staging */;
  }
  return new HeliumService(opt);
}
export {
  HeliumNetworkType,
  newHeliumService
};
