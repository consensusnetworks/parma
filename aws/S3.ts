import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { Upload } from '@aws-sdk/lib-storage'

export async function uploadToS3 (data: string | Buffer | Uint8Array, destination: string): Promise<void> {
  if (!destination.startsWith('s3://')) {
    throw new Error('Invalid destination')
  }

  const [bucket, ...keys] = destination.split(':/')[1].split('/').splice(1)

  if (bucket === '') throw new Error('bucket name cannot be empty')

  if (keys.length === 0) {
    throw new Error('path cannot be empty')
  }

  try {
    const s3Client = await newS3Client()

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: keys.join('/'),
        Body: data
      },
      leavePartsOnError: true
    })

    upload.on('httpUploadProgress', (progess) => {
      // eslint-disable-next-line
      console.log(`Uploading ${progess.loaded}/${progess.total}`)
    })

    await upload.done()
  } catch (err) {
    throw new Error('Unable to upload to S3')
  }
}
// const upload = new PutObjectCommand({
//   Bucket: bucket,
//   Key: keys.join('/'),
//   Body: data
// })

// const client = await newS3Client({})

// await client.send(upload).catch(err => {
//   throw new Error(err)
// })

export async function newS3Client (opt?: S3ClientConfig): Promise<S3Client> {
  if (opt?.region === undefined) {
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
