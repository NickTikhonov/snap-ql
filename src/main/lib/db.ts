import pg from 'pg'
import mysql from 'mysql2/promise';

// check if it is a valid postgres or mysql connection string. testing only the first part of the connection string.
// e.g.:
// mysql:  mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700
// postgres: postgres://postgres:123456@127.0.0.1:5432/dummy
function parseConnectionString(connectionString: string): 'postgres' | 'mysql' | null {
  // split by // and check if the first part is postgres or mysql
  const parts = connectionString.split('//')
  if (parts.length > 0) {
    const firstPart = parts[0]
    if (firstPart.includes('postgres')) {
      return 'postgres'
    }
    if (firstPart.includes('mysql')) {
      return 'mysql'
    }
  }
  return null
}

export async function testConnectionString(connectionString: string): Promise<void> {
  console.log('Testing connection string: ', connectionString)
  const dbType = parseConnectionString(connectionString)
  console.log('DB type: ', dbType)
  if (dbType === 'postgres') {
    const client = new pg.Client({ connectionString })
    await client.connect()
    await client.end()
  } else if (dbType === 'mysql') {
    const client = await mysql.createConnection(connectionString)
    await client.connect()
    await client.end()
  } else {
    throw new Error('Invalid connection string')
  }
}

export async function runQuery(connectionString: string, query: string): Promise<any[]> {
  const dbType = parseConnectionString(connectionString)
  if (!dbType) {
    throw new Error('Invalid connection string')
  }
  if (dbType === 'postgres') {
    console.log('Running Postgres query: ', query)
    const client = new pg.Client({ connectionString })
    await client.connect()
    const result = await client.query(query)
    await client.end()
    return result.rows
  } else {
    console.log('Running MySQL query: ', query)
    const client = await mysql.createConnection(connectionString)
    const [results] = await client.query(query)
    await client.end()
    const rows = results as any[]
    return rows
  }
}

export async function getTableSchema(connectionString: string) {
  // TODO: figure out how to do this for mysql
  const postgresSchemaQuery = `
    SELECT 
      t.table_name,
      c.column_name,
      c.data_type,
      c.character_maximum_length,
      c.is_nullable,
      c.column_default,
      tc.constraint_type,
      cc.table_name AS foreign_table_name,
      cc.column_name AS foreign_column_name
    FROM 
      information_schema.tables t
    JOIN 
      information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN 
      information_schema.key_column_usage kcu ON t.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN 
      information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
    LEFT JOIN 
      information_schema.constraint_column_usage cc ON tc.constraint_name = cc.constraint_name
    WHERE 
      t.table_schema = 'public'
    ORDER BY 
      t.table_name, c.ordinal_position;
  `

  const mysqlSchemaQuery = `
    SELECT 
      t.TABLE_NAME AS table_name,
      c.COLUMN_NAME AS column_name,
      c.DATA_TYPE AS data_type,
      c.CHARACTER_MAXIMUM_LENGTH AS character_maximum_length,
      c.IS_NULLABLE AS is_nullable,
      c.COLUMN_DEFAULT AS column_default,
      tc.CONSTRAINT_TYPE AS constraint_type,
      cc.REFERENCED_TABLE_NAME AS foreign_table_name,
      cc.REFERENCED_COLUMN_NAME AS foreign_column_name
    FROM 
      information_schema.tables t
    JOIN 
      information_schema.columns c ON t.TABLE_NAME = c.TABLE_NAME
    LEFT JOIN 
      information_schema.KEY_COLUMN_USAGE kcu ON t.TABLE_NAME = kcu.TABLE_NAME AND c.COLUMN_NAME = kcu.COLUMN_NAME
    LEFT JOIN 
      information_schema.TABLE_CONSTRAINTS tc ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
    LEFT JOIN 
      information_schema.REFERENTIAL_CONSTRAINTS rc ON tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
    LEFT JOIN 
      information_schema.KEY_COLUMN_USAGE cc ON rc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
    WHERE 
      t.TABLE_SCHEMA = DATABASE()
    ORDER BY 
      t.TABLE_NAME, c.ORDINAL_POSITION;
  `

  const dbType = parseConnectionString(connectionString)
  if (!dbType) {
    throw new Error('Invalid connection string')
  }
  const schemaQuery = dbType === 'postgres' ? postgresSchemaQuery : mysqlSchemaQuery
  const metadata = await runQuery(connectionString, schemaQuery)

  // Format the schema information into a readable string
  const schemaInfo = metadata.reduce((acc: Record<string, any[]>, row) => {
    if (!acc[row.table_name]) {
      acc[row.table_name] = []
    }

    let columnDef = `${row.column_name} ${row.data_type}`
    if (row.character_maximum_length) {
      columnDef += `(${row.character_maximum_length})`
    }
    if (row.is_nullable === 'NO') {
      columnDef += ' NOT NULL'
    }
    if (row.constraint_type === 'PRIMARY KEY') {
      columnDef += ' PRIMARY KEY'
    }
    if (row.constraint_type === 'FOREIGN KEY') {
      columnDef += ` REFERENCES ${row.foreign_table_name}(${row.foreign_column_name})`
    }
    if (row.column_default) {
      columnDef += ` DEFAULT ${row.column_default}`
    }

    acc[row.table_name].push(columnDef)
    return acc
  }, {})

  // Convert to CREATE TABLE format
  const schema = Object.entries(schemaInfo)
    .map(([tableName, columns]) => {
      const uniqueColumns = Array.from(new Set(columns))
      return `${tableName} (\n  ${uniqueColumns.join(',\n  ')}\n)`
    })
    .join('\n\n')

  console.log('Table schema: ', schema)
  return schema
}
