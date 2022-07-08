#!/usr/bin/env node

import arg from 'arg'
import fs from 'fs/promises'
import pc from 'picocolors'
import { newIoTexService, IotexNetworkType, IotexServiceOptions } from './services/IotexService'
import { HeliumServiceOptions, HeliumNetworkType, newHeliumService } from './services/HeliumService'
import { newAccumulateService, AccumulateNetworkType, AccumulateServiceOptions } from './services/AccumulateService'
import { uploadToS3 } from './aws/S3'
import { createSpinner } from 'nanospinner'
import { createWriteStream } from 'fs'
import JSONbig from 'json-bigint'

const supportedChains: { [key: string]: [string] } = {
  iotex: ['actions'],
  helium: ['blocks'],
  accumulate: ['transactions']
}

type ServiceOptionType = IotexServiceOptions | HeliumServiceOptions | AccumulateServiceOptions
type ServiceNetworkType = IotexNetworkType | HeliumNetworkType | AccumulateNetworkType

interface CLIServiceConfig {
  chain: keyof typeof supportedChains
  command: keyof typeof supportedChains[keyof typeof supportedChains]
  network: ServiceNetworkType
  option: Partial<ServiceOptionType>
  output: string
}

const usage = `
${pc.bold('Usage:')}
    parma [chain] [command] [flags]

${pc.bold('Chains:')}
    iotex   Crawl iotex blockchain
    helium  Crawl helium blockchain
    
${pc.bold('Commands:')}
    actions Crawl actions
    blocks Crawl blocks
    
${pc.bold('Flags:')}
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
    -c    --count         Count of things to crawl
    -o    --output        Location to save the output
  
${pc.bold('Example:')} 
    parma iotex actions --net testnet # crawl iotex actions from testnet
    parma helium blocks --output --output s3://superbucket/chain1/file.json # crawl helium blocks and save the result to s3
`

const args = arg({
  '--help': Boolean,
  '--version': Boolean,
  '--net': String,
  '--count': Number,
  '--output': String,

  '-h': '--help',
  '-v': '--version',
  '-n': '--net',
  '-c': '--count',
  '-o': '--output'

})

async function run (args: any): Promise<void> {
  if (args['--version'] !== undefined) {
    console.log('v1.0.0')
    process.exit(0)
  }

  if (args['--help'] !== undefined) {
    console.log(usage)
    process.exit(0)
  }

  if (args._.length === 0) {
    console.log(usage)
    process.exit(0)
  }

  if (args._.length !== 2) {
    console.error(`${pc.red('Error:')} You must specify an action: e.g. ${pc.bold('crawlerr iotex actions')}`)
    process.exit(1)
  }

  if (supportedChains[args._[0]] === undefined) {
    console.error(pc.red('Error:'), `Unsupported chain ${args._[0] as string}. Supported chains: ${pc.bold(Object.keys(supportedChains).join(', '))}`)
    process.exit(1)
  }

  const options: CLIServiceConfig = {
    chain: args._[0],
    network: args['--net'],
    command: args._[1],
    output: args['--output'],
    option: {}
  }

  if (supportedChains[options.chain] === null) {
    console.error(pc.red('Error:'), `Unsupported chain ${options.chain}`)
    process.exit(1)
  }

  if (options.output === undefined) {
    options.output = process.cwd() + '/output.json'
    console.log(pc.yellow('Warning:'), `No output specified. Using ${options.output}`)
  }

  if (options.chain === 'iotex') {
    if (options.network === undefined) {
      console.log(pc.yellow('Warning:'), 'No network specified, using mainnet')
      options.network = IotexNetworkType.Mainnet
    }

    const service = await newIoTexService({
      network: options.network as IotexNetworkType
    })

    if (args._[1] === 'actions') {
      const meta = await service.getChainMetadata()
      const height = parseInt(meta.chainMeta.height)

      const trips = Math.ceil(height / 1000)

      const stream = createWriteStream(options.output, {
        flags: 'a',
        encoding: 'utf8',
        highWaterMark: 16 * 1024
      })

      const spinner = createSpinner('Crawling...').start()

      let chunk = ''

      for (let i = 0; i < trips; i++) {
        const from = height - (i * 1000)
        const actions = await service.getCreateStakeActionsByIndex(from, 1000)

        if (actions.length === 0) {
          continue
        }
        if (i % 5 === 0) {
          stream.write(chunk)

          stream.on('error ', (err: any) => {
            spinner.stop()
            console.error(pc.red('Error:'), err)
            process.exit(1)
          })

          stream.on('finish', () => {
            spinner.success({ text: `${pc.bgGreen('Done \u2713')}` + '\n' })
            stream.end()
            process.exit(0)
          })

          chunk = ''
        }

        actions.forEach((action: any) => {
          // eslint-disable-next-line
          chunk += JSONbig.stringify(action) + '\n'
        })
      }
    }

    if (args._[1] === 'blocks') {
      const blocks = await service.getBlockMetasByIndex(1, 1000)
      await saveOutput(JSON.stringify(blocks, null, 2), options.output)

      console.log(`${pc.bgGreen('Done \u2713')}`)
      process.exit(0)
    }

    console.log(`${pc.red('Error:')} You must specify an action: e.g. ${pc.bold('parma iotex actions')}`)
    process.exit(1)
  }

  if (options.chain === 'helium') {
    const heliumOpt: HeliumServiceOptions = {
      network: HeliumNetworkType.Production
    }

    const service = await newHeliumService(heliumOpt)

    if (args._[1] === 'blocks') {
      const blocks = await service.getBlocksByHeight(5)
      await saveOutput(JSON.stringify(blocks, null, 2), options.output)

      console.log(`${pc.bgGreen('Done \u2713')}`)
      process.exit(0)
    }

    console.log(`${pc.red('Error:')} You must specify an action: e.g. ${pc.bold('crawlerr helium blocks')}`)
    process.exit(1)
  }

  if (options.chain === 'accumulate') {
    const accumulateOpt: AccumulateServiceOptions = {
      network: AccumulateNetworkType.Testnet
    }

    if (args._[1] === 'transactions') {
      const service = await newAccumulateService(accumulateOpt)
      console.log(service)

      console.log(`${pc.bgGreen('Done \u2713')}`)
      process.exit(0)
    }

    console.log(`${pc.red('Error:')} You must specify an action: e.g. ${pc.bold('crawlerr accumulate transactions')}`)
    process.exit(1)
  }

  console.log(`${pc.red('Error:')} You must specify a chain: e.g. ${pc.bold('crawlerr iotex actions')}`)
  process.exit(1)
}

async function saveOutput (data: string, dest: string): Promise<void> {
  if (dest.startsWith('./') || dest.startsWith('../')) {
    await fs.writeFile(dest, data, 'utf8').catch(err => {
      console.log(err)
      process.exit(1)
    })
    return
  }

  if (dest.startsWith('s3://')) {
    await uploadToS3(data, dest)
    return
  }

  if (dest.startsWith('/')) {
    await fs.writeFile(dest, data, 'utf8').catch(err => {
      console.log(err)
      process.exit(1)
    }
    )
    return
  }
  throw new Error('Unsupported destination')
}

process.on('unhandledRejection', (reason) => {
  console.log(reason as string)
  process.exit(1)
})

run(args).catch(err => {
  if (err.code === 'ARG_UNKNOWN_OPTION') {
    const errMsg = err.message.split('\n')
    console.log(`${pc.red('Error: ')} ${errMsg as string}, see ${pc.bold('crawlerr --help')}`)
    process.exit(1)
  }
  console.log(err)
  process.exit(1)
})
