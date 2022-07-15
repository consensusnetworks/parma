import { Client } from "accumulate.js";
var AccumulateNetworkType = /* @__PURE__ */ ((AccumulateNetworkType2) => {
  AccumulateNetworkType2["Mainnet"] = "mainnet";
  AccumulateNetworkType2["Testnet"] = "testnet";
  return AccumulateNetworkType2;
})(AccumulateNetworkType || {});
class AccumulateService {
  constructor(opt) {
    this.network = opt.network;
    this.client = new Client(this.network === "mainnet" /* Mainnet */ ? "https://testnet.accumulatenetwork.io/v2" : "https://testnet.accumulatenetwork.io/v2");
  }
}
async function newAccumulateService(opt) {
  return new AccumulateService(opt);
}
export {
  AccumulateNetworkType,
  newAccumulateService
};
