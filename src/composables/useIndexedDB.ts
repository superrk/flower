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

export async function saveImages(base64DataList: string[]): Promise<string[]> {
  const keys: string[] = []
  for (const base64Data of base64DataList) {
    const key = `img-${Date.now()}-${Math.random().toString(36).substring(2)}`
    await saveImage(key, base64Data)
    keys.push(key)
  }
  return keys
}

export async function getImage(key: string): Promise<string | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, key)
}

export async function getImages(keys: string[]): Promise<(string | undefined)[]> {
  const results: (string | undefined)[] = []
  for (const key of keys) {
    const image = await getImage(key)
    results.push(image)
  }
  return results
}

export async function deleteImage(key: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, key)
}

export async function deleteImages(keys: string[]): Promise<void> {
  for (const key of keys) {
    await deleteImage(key)
  }
}

export async function getAllImageKeys(): Promise<string[]> {
  const db = await getDB()
  return db.getAllKeys(STORE_NAME) as Promise<string[]>
}
