import { AthenaClient } from "@aws-sdk/client-athena";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
async function newAthenaClient(opt) {
  if (opt.credentials === void 0) {
    opt = {
      credentials: await defaultProvider()
    };
  }
  const client = new AthenaClient(opt);
  return client;
}
export {
  newAthenaClient
};
