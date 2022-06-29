#!/usr/bin/env node

import arg from 'arg'
import pc from 'picocolors'
import { newIoTexService, Network } from './services/IotexService'

const usage = `
${pc.bold('Usage:')}
    crawlerr [commands] [arg] [flags]
${pc.bold('Commands:')}
    crawl   Crawls the specified chain
${pc.bold('Flags:')}
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
  
${pc.bold('Example:')} 
    crawlerr --net testnet
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

// any for now
async function run (args: any): Promise<void> {
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
    network: Network.Testnet
  }

  if (args['--net'] !== undefined) {
    options.network = args['--net'] as Network
  }

  // crawl action
  if (args._[0] === 'crawl') {
    const service = await newIoTexService({
      network: options.network,
      endpoint: 'https://api.testnet.iotex.one:443'
    })

    const meta = await service.getChainMetadata()
    const actions = await service.getActions()

    print(meta)
    print(actions)
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
