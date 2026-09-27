import { describe, expect, it } from 'vitest'
import {
  createLocalStorageTaskRepository,
  TASKS_STORAGE_KEY,
} from './local-storage-repository.ts'
import { TaskStorageError } from './types.ts'

class MemoryStorage implements Storage {
  private items = new Map<string, string>()

  get length() {
    return this.items.size
  }

  clear() {
    this.items.clear()
  }

  getItem(key: string) {
    return this.items.get(key) ?? null
  }

  key(index: number) {
    return [...this.items.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.items.delete(key)
  }

  setItem(key: string, value: string) {
    this.items.set(key, value)
  }
}

function repository(storage: Storage = new MemoryStorage()) {
  let clock = 0
  let ids = 0
  return createLocalStorageTaskRepository(storage, {
    now: () => new Date(Date.UTC(2026, 8, 27, 0, 0, clock++)),
    createId: () => `task-${++ids}`,
  })
}

describe('localStorage task repository', () => {
  it('lists only the requested day and keeps other days stored', async () => {
    const storage = new MemoryStorage()
    const tasks = repository(storage)

    await tasks.create({ title: '  Yesterday  ', date: '2026-09-26' })
    await tasks.create({ title: 'Write the note', date: '2026-09-27' })

    const today = await tasks.listByDate('2026-09-27')
    expect(today.map((task) => task.title)).toEqual(['Write the note'])
    expect(storage.getItem(TASKS_STORAGE_KEY)).toContain('Yesterday')
  })

  it('keeps tasks in the order they were added', async () => {
    const tasks = repository()
    await tasks.create({ title: 'First', date: '2026-09-27' })
    await tasks.create({ title: 'Second', date: '2026-09-27' })

    const titles = (await tasks.listByDate('2026-09-27')).map((task) => task.title)
    expect(titles).toEqual(['First', 'Second'])
  })

  it('updates the title and completed flag without moving the day', async () => {
    const tasks = repository()
    const created = await tasks.create({ title: 'Call back', date: '2026-09-27' })
    const renamed = await tasks.update(created.id, { title: ' Call Ali ' })
    const done = await tasks.update(created.id, { completed: true })

    expect(renamed.title).toBe('Call Ali')
    expect(done.completed).toBe(true)
    expect(done.date).toBe('2026-09-27')
  })

  it('deletes one task', async () => {
    const tasks = repository()
    const kept = await tasks.create({ title: 'Keep', date: '2026-09-27' })
    const removed = await tasks.create({ title: 'Remove', date: '2026-09-27' })

    await tasks.delete(removed.id)

    const remaining = await tasks.listByDate('2026-09-27')
    expect(remaining.map((task) => task.id)).toEqual([kept.id])
  })

  it('rejects a blank title and does not write', async () => {
    const storage = new MemoryStorage()
    const tasks = repository(storage)

    await expect(tasks.create({ title: '   ', date: '2026-09-27' })).rejects.toBeInstanceOf(
      TaskStorageError,
    )
    expect(storage.getItem(TASKS_STORAGE_KEY)).toBeNull()
  })

  it('reports a missing task', async () => {
    const tasks = repository()
    await expect(tasks.update('missing', { completed: true })).rejects.toThrow(
      'That task could not be found.',
    )
  })

  it('reports corrupt storage', async () => {
    const storage = new MemoryStorage()
    storage.setItem(TASKS_STORAGE_KEY, '{')
    const tasks = repository(storage)

    await expect(tasks.listByDate('2026-09-27')).rejects.toThrow(
      'Saved tasks could not be read.',
    )
  })

  it('reports a full browser store', async () => {
    const storage = new MemoryStorage()
    storage.setItem = () => {
      const error = new Error('quota')
      error.name = 'QuotaExceededError'
      throw error
    }
    const tasks = repository(storage)

    await expect(tasks.create({ title: 'Too big', date: '2026-09-27' })).rejects.toThrow(
      'This browser has no room left to save tasks.',
    )
  })
})
