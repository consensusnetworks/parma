import { AthenaClient, AthenaClientConfig } from '@aws-sdk/client-athena'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

export async function newAthenaClient (opt: AthenaClientConfig): Promise<AthenaClient> {
  if (opt.credentials === undefined) {
    opt = {
      credentials: await defaultProvider()
    }
  }
  const client = new AthenaClient(opt)
  return client
}
