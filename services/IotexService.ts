import { BaseService } from "./Base";
import Antenna from "iotex-antenna";

export enum Network {
   Mainnet = "mainnet",
   Testnet = "testnet"
}

type Endpoint = `https://api.iotex.one:443` | `https://api.testnet.iotex.one:443`

class IoTexService extends BaseService {
    network: Network
    endpoint: Endpoint
    client: Antenna
    constructor(network: Network) {
        super()
        this.network = network
        this.endpoint = `https://api.iotex.one:443`
        this.client = new Antenna(this.endpoint)
    }

    async getChainMetadata() {
        const ret = await this.client.iotx.getChainMeta({});
        console.log(ret.chainMeta)
        return 22
    }
}

export async function newIoTexService(network?: Network): Promise<IoTexService> {
    if (!network) {
        network = network || Network.Testnet
    }
    return new IoTexService(network)
}
