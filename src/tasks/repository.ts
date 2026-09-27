import {
  createLocalStorageTaskRepository,
  TASKS_STORAGE_KEY,
} from './local-storage-repository.ts'
import { TaskStorageError, type TaskRepository } from './types.ts'

// Replace this with a SQL-backed TaskRepository when a database is added.
export function getTaskRepository(): TaskRepository {
  return createLocalStorageTaskRepository(browserStorage())
}

function browserStorage(): Storage {
  try {
    if (typeof window === 'undefined' || window.localStorage == null) {
      throw new Error('missing')
    }
    const storage = window.localStorage
    storage.getItem(TASKS_STORAGE_KEY)
    return storage
  } catch (error) {
    if (error instanceof TaskStorageError) throw error
    throw new TaskStorageError('Browser storage is unavailable in this session.')
  }
}
