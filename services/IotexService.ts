import Antenna from 'iotex-antenna'
import { IGetChainMetaResponse } from 'iotex-antenna/lib/rpc-method/types'

export enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet'
}

type Endpoint = 'https://api.iotex.one:443' | 'https://api.testnet.iotex.one:443'

interface ServiceOptions {
  endpoint: Endpoint
  network: Network
}

class IoTexService {
  network: Network
  endpoint: Endpoint
  client: Antenna
  constructor (opt: ServiceOptions) {
    this.network = opt.network
    this.endpoint = opt.endpoint
    this.client = new Antenna(this.endpoint)
  }

  async getChainMetadata (): Promise<IGetChainMetaResponse> {
    const meta = await this.client.iotx.getChainMeta({})
    return meta
  }

  async getActions (): Promise<any> {
    const actions = await this.client.iotx.getActions({})
    return actions
  }

  async getGasPrice (): Promise<any> {
    const { gasPrice } = await this.client.iotx.suggestGasPrice({})
    return gasPrice
  }
}

export async function newIoTexService (opt: ServiceOptions): Promise<IoTexService> {
  if (opt.network === undefined) {
    opt.network = Network.Mainnet
  }
  return new IoTexService(opt)
}
