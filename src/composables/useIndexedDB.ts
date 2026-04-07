import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'flower-diary-db'
const DB_VERSION = 1
const STORE_NAME = 'plant-images'

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })

  return dbInstance
}

export async function saveImage(key: string, base64Data: string): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, base64Data, key)
}

export async function getImage(key: string): Promise<string | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, key)
}

export async function deleteImage(key: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, key)
}

export async function getAllImageKeys(): Promise<string[]> {
  const db = await getDB()
  return db.getAllKeys(STORE_NAME) as Promise<string[]>
}
