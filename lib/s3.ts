import { S3Client, S3ClientConfig, PutObjectCommand } from '@aws-sdk/client-s3'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

export async function uploadToS3 (data: string, destination: string): Promise<void> {
  if (!destination.startsWith('s3://')) {
    throw new Error('Invalid destination')
  }

  const [bucket, ...keys] = destination.split(':/')[1].split('/').splice(1)

  if (bucket === '') throw new Error('bucket name cannot be empty')

  if (keys.length === 0) {
    throw new Error('path cannot be empty')
  }

  const upload = new PutObjectCommand({
    Bucket: bucket,
    Key: keys.join('/'),
    Body: data
  })

  const client = await s3Client({})

  await client.send(upload).catch(err => {
    throw new Error(err)
  })
}

async function s3Client (opt: S3ClientConfig): Promise<S3Client> {
  if (opt.region === undefined) {
    opt = {
      region: 'us-east-2'
    }
  }

  if (opt.credentials === undefined) {
    opt = {
      credentials: await defaultProvider()
    }
  }

  const client = new S3Client(opt)
  return client
}
