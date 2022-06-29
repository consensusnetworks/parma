#!/usr/bin/env node

import arg from 'arg'
import pc from 'picocolors'
// import { newIoTexService, Network } from './services/IotexService'

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
    crawl iotex --net testnet
`

const args = arg({
  // Types
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

  // const service = await newIoTexService(Network.Testnet)
  // const meta = await service.getChainMetadata()
  // console.log(meta)
  print(arg)
}

run(args).catch(err => {
  if (err.code === 'ARG_UNKNOWN_OPTION') {
    const errMsg = err.message.split('\n')
    print(`${pc.red('Error: ')} ${errMsg as string}, see ${pc.bold('muto --help')}`)
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
