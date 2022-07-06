import { Client } from 'accumulate.js'

export interface AccumulateServiceOptions {
  network: AccumulateNetworkType
}

export enum AccumulateNetworkType {
  Mainnet = 'mainnet',
  Testnet = 'testnet'
}

class AccumulateService {
  network: AccumulateNetworkType
  client: Client
  constructor (opt: AccumulateServiceOptions) {
    this.network = opt.network
    // only testnet seems to be up
    this.client = new Client(this.network === AccumulateNetworkType.Mainnet ? 'https://testnet.accumulatenetwork.io/v2' : 'https://testnet.accumulatenetwork.io/v2')
  }
}

export async function newAccumulateService (opt: AccumulateServiceOptions): Promise<AccumulateService> {
  return new AccumulateService(opt)
}
