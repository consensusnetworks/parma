import Antenna from 'iotex-antenna'
import { IActionInfo, IGetBlockMetasResponse, IGetChainMetaResponse } from 'iotex-antenna/lib/rpc-method/types'
import { from } from '@iotexproject/iotex-address-ts'

export interface IotexServiceOptions {
  network: IotexNetworkType
}

export enum IotexNetworkType {
  Mainnet = 'mainnet',
  Testnet = 'testnet'
}

interface CreateStakeTableColumn {
  type: string
  datestring: string
  address: string
  staked_candidate: string
  staked_amount: string
  staked_duration: number
  auto_stake: boolean
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

  async getCreateStakeActionsByIndex (start: number, count: number): Promise<CreateStakeTableColumn[]> {
    const actions = await this.getActionsByIndex(start, count)

    if (actions.length === 0) {
      throw new Error('Failed to get actions')
    }

    const filtered = actions.filter(b => b.action.core?.stakeCreate != null).map(b => {
      if (b.action.core?.stakeCreate?.payload != null) {
        b.action.core.stakeCreate.payload = b.action.core.stakeCreate.payload.toString()
      }
      if ((b.action.core?.execution) != null) {
        b.action.core.execution.data = Buffer.from(b.action.core.execution.data.slice(2)).toString('hex')
      }

      b.action.senderPubKey = Buffer.from(b.action.senderPubKey).toString('hex')
      b.action.signature = Buffer.from(b.action.signature).toString('hex')

      if (b.action.core?.stakeCreate?.stakedAmount === undefined || b.action.core?.stakeCreate?.stakedDuration === undefined || b.action.core?.stakeCreate?.autoStake === undefined) {
        throw new Error('Failed to get actions')
      }

      const r: CreateStakeTableColumn = {
        type: 'create_stake',
        datestring: 'datestring',
        address: b.action.senderPubKey,
        staked_candidate: b.action.core?.stakeCreate?.candidateName,
        staked_amount: b.action.core?.stakeCreate?.stakedAmount.toString(),
        staked_duration: b.action.core?.stakeCreate?.stakedDuration,
        auto_stake: b.action.core?.stakeCreate?.autoStake
      }
      return r
    })
    return filtered
  }

  async getActionsByIndex (start: number, count: number): Promise<IActionInfo[]> {
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

    if (actions.actionInfo == null) {
      throw new Error('Failed to get actions')
    }

    return actions.actionInfo
  }

  async getGasPrice (): Promise<any> {
    const { gasPrice } = await this.client.iotx.suggestGasPrice({})
    return gasPrice
  }

  convertEthToIotx (eth: string): string {
    const add = from(eth)
    return add.string()
  }

  convertIotxToEth (iotx: string): string {
    const add = from(iotx)
    return add.stringEth()
  }
}

export async function newIoTexService (opt: IotexServiceOptions): Promise<IoTexService> {
  return new IoTexService(opt)
}
