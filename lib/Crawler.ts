import { AccumulateService } from './services/AccumulateService'
import { IoTexService, newIotexService } from './services/IotexService'
import EventEmitter from 'events'

const S3_BUCKET = 's3://casimir-etl-event-bucket-dev/'

export enum Chain {
  Iotex = 'iotex',
  Accumulate = 'accumulate'
}

export interface CrawlerConfig {
  chain: Chain
  outputLocation: `s3://${string}`
}

class ParmaEventEmitter extends EventEmitter {
  init: Date
  constructor () {
    super()
    this.init = new Date()
  }

  main (): void {}
}

class Crawler {
  config: CrawlerConfig
  service: IoTexService | AccumulateService | null
  isRunning: boolean
  EE: ParmaEventEmitter
  init: Date
  constructor (config: CrawlerConfig) {
    this.config = config
    this.init = new Date()
    this.service = null
    this.isRunning = false
    this.EE = new ParmaEventEmitter()
  }

  async _initializeService (): Promise<void> {
    if (this.config.chain === Chain.Iotex) {
      const service = await newIotexService()
      this.service = service
      return
    }
    throw new Error('Unknown chain')
  }

  async start (): Promise<Error | null> {
    return null
  }
}

export async function newCrawler (config: Partial<CrawlerConfig> = { chain: Chain.Iotex }): Promise<Crawler> {
  const crawler = new Crawler({
    chain: Chain.Iotex,
    outputLocation: config.outputLocation ?? S3_BUCKET
  })

  await crawler._initializeService()
  return crawler
}
