import { TaskStorageError } from './types.ts'

export function errorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof TaskStorageError) return error.message
  return 'Tasks could not be saved in this browser.'
}
