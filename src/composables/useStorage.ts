const STORAGE_PREFIX = 'flower-diary-'

export function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(STORAGE_PREFIX + key, serialized)
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    if (item === null) return null
    return JSON.parse(item) as T
  } catch (error) {
    console.error('Failed to read from localStorage:', error)
    return null
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

export function clearAll(): void {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
