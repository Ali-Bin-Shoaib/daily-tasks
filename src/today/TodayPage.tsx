import { useEffect } from 'react'
import { errorMessage } from '../tasks/error-message.ts'
import { formatLongDate } from '../tasks/local-date.ts'
import { useLocalDateKey } from '../tasks/use-local-date.ts'
import {
  useCreateTask,
  useDeleteTask,
  useSyncTasksAcrossTabs,
  useTasks,
  useUpdateTask,
} from '../tasks/use-tasks.ts'
import { AddTaskForm } from './AddTaskForm.tsx'
import { TaskItem } from './TaskItem.tsx'

export function TodayPage() {
  const date = useLocalDateKey()
  const tasks = useTasks(date)
  const createTask = useCreateTask(date)
  const updateTask = useUpdateTask(date)
  const deleteTask = useDeleteTask(date)
  useSyncTasksAcrossTabs()

  const formattedDate = formatLongDate(date)
  const items = tasks.data ?? []
  const openCount = items.filter((task) => !task.completed).length
  const doneCount = items.length - openCount
  const message =
    errorMessage(tasks.error) ??
    errorMessage(createTask.error) ??
    errorMessage(updateTask.error) ??
    errorMessage(deleteTask.error)
  const pending = createTask.isPending || updateTask.isPending || deleteTask.isPending

  useEffect(() => {
    document.title = `Today · ${formattedDate}`
  }, [formattedDate])

  return (
    <>
      <header className="masthead">
        <p className="eyebrow">Today</p>
        <h1>{formattedDate}</h1>
        {items.length > 0 ? (
          <p className="summary">
            {openCount} open · {doneCount} done
          </p>
        ) : null}
      </header>

      {message ? (
        <p className="banner" role="alert">
          {message}
        </p>
      ) : null}

      <AddTaskForm
        pending={createTask.isPending}
        onAdd={async (title) => {
          await createTask.mutateAsync(title)
        }}
      />

      {tasks.isPending ? <p className="status">Loading today’s tasks…</p> : null}

      {!tasks.isPending && !tasks.isError && items.length === 0 ? (
        <p className="status">Nothing for today yet.</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="task-list">
          {items.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              pending={pending}
              onToggle={async (completed) => {
                await updateTask.mutateAsync({ id: task.id, patch: { completed } })
              }}
              onRename={async (title) => {
                await updateTask.mutateAsync({ id: task.id, patch: { title } })
              }}
              onDelete={async () => {
                await deleteTask.mutateAsync(task.id)
              }}
            />
          ))}
        </ul>
      ) : null}
    </>
  )
}
