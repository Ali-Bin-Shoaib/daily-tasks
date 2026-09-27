export type Task = {
  id: string
  title: string
  completed: boolean
  date: string
  createdAt: string
  updatedAt: string
}

export type TaskPatch = {
  title?: string
  completed?: boolean
}

export type TaskRepository = {
  listByDate(date: string): Promise<Task[]>
  create(input: { title: string; date: string }): Promise<Task>
  update(id: string, patch: TaskPatch): Promise<Task>
  delete(id: string): Promise<void>
}

export class TaskStorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TaskStorageError'
  }
}
