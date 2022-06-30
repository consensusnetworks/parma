#!/usr/bin/env node

import arg from 'arg'
import fs from 'fs/promises'
import pc from 'picocolors'
import { newIoTexService, Network } from './services/IotexService'

const supportedChains: { [key: string]: [string] } = {
  iotex: ['actions']
}

const usage = `
${pc.bold('Usage:')}
    crawlerr [chain] [command] [flags]
${pc.bold('Chains:')}
    iotex   Crawl iotex

${pc.bold('Commands:')}
    actions Crawl actions
    blocks Crawl blocks
    
${pc.bold('Flags:')}
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
  
${pc.bold('Example:')} 
    crawlerr iotex actions --net testnet
`

const args = arg({
  '--help': Boolean,
  '--version': Boolean,
  '--net': String,

  // Aliases
  '-h': '--help',
  '-v': '--version',
  '-n': '--net'
})

async function run (args: any): Promise<void> {
  if (supportedChains[args._[0]] === undefined) {
    console.error(pc.red('Error:'), 'You must specifiy a chain and action')
    return
  }

  if (args._.length !== 2) {
    print(`${pc.red('Error:')} You must specify an action: e.g. ${pc.bold('crawlerr iotex actions')}`)
    process.exit(1)
  }

  if (args['--help'] !== undefined) {
    print(usage)
    process.exit(0)
  }

  if (args['--version'] !== undefined) {
    print('v1.0.0')
    process.exit(0)
  }

  if (args._.length === 0) {
    print(usage)
    process.exit(0)
  }

  const options = {
    chain: args._[0],
    network: Network.Mainnet
  }

  if (args['--net'] !== undefined) {
    options.network = args['--net'] as Network
  }

  // iotex
  if (args._[0] === 'iotex') {
    const service = await newIoTexService({
      network: options.network,
      endpoint: 'https://api.testnet.iotex.one:443'
    })
    // actions
    if (args._[1] === 'actions') {
      const actions = await service.getActionsByIndex(1, 1000)

      await fs.writeFile('./actions.json', JSON.stringify(actions, null, 2), 'utf8').catch(err => {
        print(err)
        process.exit(1)
      })

      process.exit(0)
    }

    if (args._[1] === 'blocks') {
      const blocks = await service.getBlockMetasByIndex(1, 1000)
      await fs.writeFile('./blocks.json', JSON.stringify(blocks, null, 2), 'utf8').catch(err => {
        print(err)
        process.exit(1)
      })
      process.exit(0)
    }
    print(`${pc.red('Error:')} You must specify an action: e.g. ${pc.bold('crawlerr iotex actions')}`)
  }
  process.exit(0)
}

run(args).catch(err => {
  if (err.code === 'ARG_UNKNOWN_OPTION') {
    const errMsg = err.message.split('\n')
    print(`${pc.red('Error: ')} ${errMsg as string}, see ${pc.bold('crawlerr --help')}`)
    process.exit(1)
  }
  print(err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  print(reason as string)
  process.exit(1)
})

function print (msg: string | {}): void {
  typeof msg === 'string'
    ? process.stdout.write(`${msg} \n`)
    : process.stdout.write(`${JSON.stringify(msg, null, 2)} \n`)
}
