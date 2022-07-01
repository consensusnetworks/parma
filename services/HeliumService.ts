import { Client, Network } from '@helium/http'
import type Blocks from '@helium/http/build/models/Block'

export interface HeliumServiceOptions {
  network: HeliumNetworkType
}

export enum HeliumNetworkType {
  Production = 'production',
  Staging = 'staging',
}

class HeliumService {
  network: HeliumNetworkType
  client: Client
  constructor (opt: HeliumServiceOptions) {
    this.network = opt.network
    this.client = new Client(this.network === HeliumNetworkType.Production ? Network.production : Network.staging)
  }

  async getBlocksByHeight (height: number): Promise<Blocks> {
    if (height < 0) {
      throw new Error('height must be greater than 0')
    }

    if (height === 0) {
      height = 1
    }

    const blocks = await this.client.blocks.get(height)

    const g = await this.client.stats.get()

    console.log(g)
    return blocks
  }
}

export async function newHeliumService (opt: HeliumServiceOptions): Promise<HeliumService> {
  if (opt.network === undefined) {
    opt.network = HeliumNetworkType.Staging
  }
  return new HeliumService(opt)
}
