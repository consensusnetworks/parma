## Parma


[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Usage

### Install

Install the CLI using npm

```bash
npm i @consensusnetwork/parma -g
```

## API

```bash
Usage:
    parma [chain] [command] [flags]

Chains:
    iotex   Crawl iotex blockchain
    helium  Crawl helium blockchain
    
Commands:
    actions Crawl actions
    blocks Crawl blocks
    
Flags:
    -h    --help          Print help (what you are reading now)
    -v    --version       Print version
    -n    --net           Network to use (mainnet or testnet)
    -c    --count         Count of things to crawl
    -o    --output        Location to save the output
  
Example: 
    parma iotex actions --net testnet # crawl iotex actions from testnet
    parma helium blocks --net production # crawl helium blocks from the production network
```


## Examples

Crawl the iotex mainnet
```bash
parma iotex blocks --net mainnet
```

Crawl actions on the helium blockchain and save the result to a `s3`bucket
```bash
parma helium blocks --output s3://superbucket/chain1/file.json
```