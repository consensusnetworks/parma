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

      // fs.openSync(this.config.output, 'w')
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

  async start (): Promise<void> {
    if (this.running) {
      throw new Error('Crawler is already running')
    }

    if (this.service == null) {
      throw new Error('Crawler is not initialized')
    }

    this.running = true
    if (this.service instanceof IoTexService) {
      const meta = await this.service.getChainMetadata()
      const height = parseInt(meta.chainMeta.height)
      const trips = Math.ceil(height / 1000)

      const spinner = createSpinner('Crawling... \n').start()

      for (let i = 0; i < trips; i++) {
        spinner.update({ text: (`Crawling... ${i}/${trips} \n`) })

        const data = await this.service.getBlockMetasByIndex(i * 1000, 1000)
        fs.appendFileSync(this.config.output, JSONbig.stringify(data))
      }

      spinner.stop()
      // const ws = fs.createWriteStream(this.config.output, { flags: 'a+' })

      // createStake.forEach(g => {
      //   ws.write(JSONbig.stringify(g) + '\n')
      // })

      // grantRewards.forEach(g => {
      //   ws.write(JSONbig.stringify(g) + '\n')
      // })

      // claims.forEach(g => {
      //   ws.write(JSONbig.stringify(g) + '\n')
      // })

      // ws.on('error', err => {
      //   console.error(err)
      // })

      // ws.end()
      return
    }
    throw new Error()
  }
}

export async function crawler (config: CrawlerConfig): Promise<Crawler> {
  const c = new Crawler({
    chain: config?.chain ?? Chain.Iotex,
    output: config.output,
    verbose: config.verbose ?? false
  })

  await c._init()
  return c
}
