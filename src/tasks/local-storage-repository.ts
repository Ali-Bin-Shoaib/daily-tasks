import { TaskStorageError, type Task, type TaskRepository } from './types.ts'

export const TASKS_STORAGE_KEY = 'daily-tasks:v1'

type StoredState = {
  version: 1
  tasks: Task[]
}

type RepositoryClock = {
  now?: () => Date
  createId?: () => string
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export function createLocalStorageTaskRepository(
  storage: Storage,
  clock: RepositoryClock = {},
): TaskRepository {
  const now = clock.now ?? (() => new Date())
  const createId = clock.createId ?? (() => crypto.randomUUID())

  return {
    async listByDate(date) {
      return read(storage)
        .tasks.filter((task) => task.date === date)
        .sort(
          (a, b) =>
            a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
        )
    },

    async create(input) {
      const title = requiredTitle(input.title)
      if (!datePattern.test(input.date)) {
        throw new TaskStorageError('That date is not valid.')
      }

      const state = read(storage)
      const timestamp = now().toISOString()
      const task: Task = {
        id: createId(),
        title,
        completed: false,
        date: input.date,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      write(storage, { version: 1, tasks: [...state.tasks, task] })
      return task
    },

    async update(id, patch) {
      const state = read(storage)
      const index = state.tasks.findIndex((task) => task.id === id)
      if (index === -1) {
        throw new TaskStorageError('That task could not be found.')
      }

      const current = state.tasks[index]
      if (!current) {
        throw new TaskStorageError('That task could not be found.')
      }

      const next: Task = {
        ...current,
        title: patch.title === undefined ? current.title : requiredTitle(patch.title),
        completed: patch.completed ?? current.completed,
        updatedAt: now().toISOString(),
      }
      const tasks = state.tasks.slice()
      tasks[index] = next
      write(storage, { version: 1, tasks })
      return next
    },

    async delete(id) {
      const state = read(storage)
      const tasks = state.tasks.filter((task) => task.id !== id)
      if (tasks.length === state.tasks.length) {
        throw new TaskStorageError('That task could not be found.')
      }
      write(storage, { version: 1, tasks })
    },
  }
}

function requiredTitle(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) {
    throw new TaskStorageError('Enter a task title.')
  }
  return trimmed
}

function read(storage: Storage): StoredState {
  const raw = storage.getItem(TASKS_STORAGE_KEY)
  if (raw === null) return { version: 1, tasks: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new TaskStorageError('Saved tasks could not be read.')
  }

  if (!isStoredState(parsed)) {
    throw new TaskStorageError('Saved tasks could not be read.')
  }

  return parsed
}

function write(storage: Storage, state: StoredState): void {
  try {
    storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    if (isQuotaError(error)) {
      throw new TaskStorageError('This browser has no room left to save tasks.')
    }
    throw new TaskStorageError('Tasks could not be saved in this browser.')
  }
}

function isStoredState(value: unknown): value is StoredState {
  if (!value || typeof value !== 'object') return false
  const state = value as { version?: unknown; tasks?: unknown }
  return state.version === 1 && Array.isArray(state.tasks) && state.tasks.every(isTask)
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.date === 'string' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  )
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}
