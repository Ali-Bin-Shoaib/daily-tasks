import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { fieldErrorText } from './field-error.ts'
import type { Task } from '../tasks/types.ts'

type TaskItemProps = {
  task: Task
  pending: boolean
  onToggle: (completed: boolean) => Promise<void>
  onRename: (title: string) => Promise<void>
  onDelete: () => Promise<void>
}

export function TaskItem({ task, pending, onToggle, onRename, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false)

  return (
    <li className="task">
      <input
        type="checkbox"
        checked={task.completed}
        disabled={pending}
        aria-label={task.completed ? `Mark ${task.title} open` : `Mark ${task.title} done`}
        onChange={(event) => {
          void onToggle(event.target.checked)
        }}
      />
      {editing ? (
        <EditTaskForm
          taskId={task.id}
          title={task.title}
          pending={pending}
          onCancel={() => setEditing(false)}
          onSave={async (title) => {
            await onRename(title)
            setEditing(false)
          }}
        />
      ) : (
        <p className={task.completed ? 'task-title done' : 'task-title'}>{task.title}</p>
      )}
      <div className="task-actions">
        {editing ? null : (
          <button type="button" onClick={() => setEditing(true)} disabled={pending}>
            Edit
          </button>
        )}
        <button
          type="button"
          className="danger"
          aria-label={`Delete ${task.title}`}
          disabled={pending}
          onClick={() => {
            void onDelete()
          }}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

type EditTaskFormProps = {
  taskId: string
  title: string
  pending: boolean
  onSave: (title: string) => Promise<void>
  onCancel: () => void
}

function EditTaskForm({ taskId, title, pending, onSave, onCancel }: EditTaskFormProps) {
  const form = useForm({
    defaultValues: { title },
    onSubmit: async ({ value }) => {
      await onSave(value.title)
    },
  })

  return (
    <form
      className="edit-form"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="title"
        validators={{
          onSubmit: ({ value }) => (value.trim() ? undefined : 'Enter a task title.'),
        }}
      >
        {(field) => {
          const error = field.state.meta.errors[0]
          const inputId = `edit-${taskId}`
          return (
            <div className="field">
              <label className="sr-only" htmlFor={inputId}>
                Task title
              </label>
              <input
                id={inputId}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') onCancel()
                }}
                autoComplete="off"
                disabled={pending}
              />
              {error ? <p className="field-error">{fieldErrorText(error)}</p> : null}
            </div>
          )
        }}
      </form.Field>
      <button type="submit" disabled={pending}>
        Save
      </button>
      <button type="button" onClick={onCancel} disabled={pending}>
        Cancel
      </button>
    </form>
  )
}
