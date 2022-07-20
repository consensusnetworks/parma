import { AccumulateService } from './services/AccumulateService'
import { IoTexService, newIotexService } from './services/IotexService'
import EventEmitter from 'events'
import { createSpinner } from 'nanospinner'
import JSONbig from 'json-bigint'
import fs from 'node:fs'

export enum Chain {
  Iotex = 'iotex',
  Accumulate = 'accumulate'
}

export interface CrawlerConfig {
  chain: Chain
  output: `s3://${string}` | `./${string}` | `../${string}`
  verbose: boolean
}

const sp = createSpinner()
const EE = new EventEmitter()

class Crawler {
  config: CrawlerConfig
  service: IoTexService | AccumulateService | null
  running: boolean
  EE: EventEmitter
  init: Date
  constructor (config: CrawlerConfig) {
    this.config = config
    this.init = new Date()
    this.service = null
    this.running = false
    this.EE = EE
  }

  async _init (): Promise<void> {
    if (this.config.chain === Chain.Iotex) {
      const service = await newIotexService()
      this.service = service

      fs.openSync(this.config.output, 'w')
      // if (!this.isReadbleFile(this.config.output))

      if (this.config.verbose) {
        this.EE.on('init', () => {
          console.log(`Initialized crawler for: ${this.config.chain}`)
        })
      }

      this.EE.emit('init')

      return
    }

    throw new Error('Unknown chain')
  }

  private isReadbleFile (file: string): boolean {
    return fs.existsSync(file) && fs.statSync(file).isFile()
  }

  async start (): Promise<void> {
    if (this.running) {
      throw new Error('Crawler is already running')
    }

    if (this.service == null) {
      throw new Error('Crawler is not initialized')
    }

    this.running = true
    if (this.service instanceof IoTexService) {
      const a = await this.service.getAllGovernanceActions(12000000, 1000)

      console.log(JSONbig.stringify(a?.grantReward[0], null, 2))
      const block = await this.service.getBlockMetaByHash('edfe9e7cb3e006e0c0841438de6dfefcdcbfd0e1ffcf91e5bad30879cfa65b99')
      console.log(JSONbig.stringify(block, null, 2))

      // return {
      //   type: 'grant_reward',
      //   datestring: new Date(b.timestamp.seconds * 1000).toISOString().split('T')[0],
      //   address: '',
      //   grant_type: b.action.core?.grantReward?.type
      // }

      console.log(JSONbig.stringify({
        type: 'grant_reward',
        datestring: new Date(block.blkMetas[0].timestamp.seconds * 1000).toISOString().split('T')[0],
        transfer_amount: block.blkMetas[0].transferAmount,
        address: block.blkMetas[0].producerAddress
        recepiet: 
      }, null, 2))

      // const meta = await this.service.getChainMetadata()
      // const height = parseInt(meta.chainMeta.height)
      // // const trips = Math.ceil(height / 1000)

      // const blockMetas = await this.service.getBlockMetasByIndex(height, 1000)
      // sp.stop()

      // const withActions = blockMetas.blkMetas.filter(b => b.numActions > 0)
      // console.log(JSONbig.stringify(withActions, null, 2))
      return
    }
    throw new Error('Unrecognized service type')
  }
}

export async function crawler (config: CrawlerConfig): Promise<Crawler> {
  const c = new Crawler({
    chain: config?.chain ?? Chain.Iotex,
    output: config.output ?? './output.json',
    verbose: config.verbose ?? false
  })

  await c._init()
  return c
}
