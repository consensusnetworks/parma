import { GlueClient, GlueClientConfig, GetDatabaseCommand, GetTablesCommand, GetTableCommand } from '@aws-sdk/client-glue'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

async function newGlueClient (opt: GlueClientConfig): Promise<GlueClient> {
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
  return new GlueClient(opt)
}

interface DatabaseMetadata {
  Name: string
  Description: string | undefined
  CatalogId: string
}

export async function getDatabaseMetadata (name: string): Promise<DatabaseMetadata> {
  if (name === '') {
    throw new Error('database name cannot be empty')
  }

  const glue = await newGlueClient({})

  const database = new GetDatabaseCommand({
    Name: name
  })

  const result = await glue.send(database)

  if (result.$metadata.httpStatusCode !== 200) {
    if (result.$metadata.httpStatusCode === 400) {
      throw new Error('Database not found')
    }
    throw new Error('Failed to retrieve database metadata')
  }

  if (result.Database === undefined) {
    throw new Error('Failed to retrieve database metadata')
  }

  if (result.Database.Name === undefined || result.Database.CatalogId === undefined) {
    throw new Error('Failed to retrieve database metadata')
  }

  return {
    Name: result.Database.Name,
    Description: result.Database.Description,
    CatalogId: result.Database.CatalogId
  }
}

export async function getTableMetadata (databaseName: string, tableName: string): Promise<string> {
  if (databaseName === '') {
    throw new Error('database name cannot be empty')
  }

  if (tableName === '') {
    throw new Error('table name cannot be empty')
  }

  const glue = await newGlueClient({})

  const table = new GetTableCommand({
    DatabaseName: databaseName,
    Name: tableName
  })

  const result = await glue.send(table)

  if (result.$metadata.httpStatusCode !== 200) {
    if (result.$metadata.httpStatusCode === 400) {
      throw new Error('Table not found')
    }

    throw new Error('Failed to retrieve table metadata')
  }

  if (result.Table === undefined) {
    throw new Error('Failed to retrieve table metadata')
  }

  console.log(result.Table)

  return 'ww'
}

export async function getDatabaseTables (name: string): Promise<any> {
  if (name === '') {
    throw new Error('Database name cannot be empty')
  }

  const glue = await newGlueClient({})

  const database = new GetTablesCommand({
    DatabaseName: name
  })

  const result = await glue.send(database)

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error('Failed to retrieve database tables')
  }

  if (result.TableList === undefined) {
    throw new Error('Failed to retrieve database tables')
  }
  return result.TableList
}

async function main (): Promise<void> {
  const t = await getTableMetadata('casimir_etl_database_dev', 'casimir_etl_event_table_dev')

  console.log(t)
}

main().catch(err => console.log(err))
