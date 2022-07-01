import Antenna from 'iotex-antenna'
import { IGetActionsResponse, IGetBlockMetasResponse, IGetChainMetaResponse } from 'iotex-antenna/lib/rpc-method/types'

export interface IotexServiceOptions {
  network: IotexNetworkType
}

export enum IotexNetworkType {
  Mainnet = 'mainnet',
  Testnet = 'testnet'
}

class IoTexService {
  network: IotexNetworkType
  endpoint: string
  client: Antenna
  constructor (opt: IotexServiceOptions) {
    this.network = opt.network
    this.endpoint = this.network === IotexNetworkType.Mainnet ? 'https://api.iotex.one:443' : 'https://api.testnet.iotex.one:443'
    this.client = new Antenna(this.endpoint)
  }

  async getChainMetadata (): Promise<IGetChainMetaResponse> {
    const meta = await this.client.iotx.getChainMeta({})
    return meta
  }

  async getActionByHash (hash: string): Promise<any> {
    const action = await this.client.iotx.getActions({
      byHash: {
        actionHash: hash,
        checkPending: true
      }
    })
    return action
  }

  async getBlockMetasByIndex (start: number, count: number): Promise< IGetBlockMetasResponse> {
    if (start < 0 || count < 0) {
      throw new Error('start and count must be greater than 0')
    }

    if (start === 0) {
      start = 1
    }

    // default to 100
    if (count === 0) {
      count = 100
    }

    const metas = await this.client.iotx.getBlockMetas({ byIndex: { start: count, count: count } })
    return metas
  }

  async getAccountActions (address: string): Promise<any> {
    const account = await this.client.iotx.getAccount({
      address
    })

    if (account.accountMeta == null) {
      return []
    }

    const actions = await this.client.iotx.getActions({
      byAddr: {
        address: account.accountMeta.address,
        start: 1,
        count: 10
      }
    })

    return actions
  }

  async getActionsByIndex (start: number, count: number): Promise<IGetActionsResponse> {
    if (start < 0 || count < 0) {
      throw new Error('start and count must be greater than 0')
    }

    if (count === 0) {
      count = 100
    }

    if (start === 0) {
      start = 1
    }

    const actions = await this.client.iotx.getActions({
      byIndex: {
        start,
        count
      }
    })

    actions.actionInfo.forEach(info => {
      if ((info.action.core?.execution) != null) {
        info.action.core.execution.data = Buffer.from(info.action.core.execution.data.slice(2)).toString('hex')
      }
      // if (info.action.core?.putPollResult != null) {
      //   info.action.core.putPollResult.candidates?.candidates.forEach(candidate => {
      //     candidate.votes = Buffer.from(candidate.votes).toString('hex')
      //   })
      // }

      // if (info.action.core?.stakeCreate != null) {
      //   console.log(info.action)
      // }

      info.action.senderPubKey = Buffer.from(info.action.senderPubKey).toString('hex')
      info.action.signature = Buffer.from(info.action.signature).toString('hex')
    })
    return actions
  }

  async getGasPrice (): Promise<any> {
    const { gasPrice } = await this.client.iotx.suggestGasPrice({})
    return gasPrice
  }
}

export async function newIoTexService (opt: IotexServiceOptions): Promise<IoTexService> {
  if (opt.network === undefined) {
    opt.network = IotexNetworkType.Mainnet
  }
  return new IoTexService(opt)
}
