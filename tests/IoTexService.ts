import { newIoTexService, Network } from '../services/IotexService'
import tap from 'tap'

tap.test('IoTexService', async (t) => {
  const service = await newIoTexService(Network.Testnet)

  t.test('getChainMetadata', async (t) => {
    const meta = await service.getChainMetadata()
    t.ok(meta)

    t.end()
  })

  t.end()
})
