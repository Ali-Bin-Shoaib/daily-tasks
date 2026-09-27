import { useForm } from '@tanstack/react-form'
import { fieldErrorText } from './field-error.ts'

type AddTaskFormProps = {
  pending: boolean
  onAdd: (title: string) => Promise<void>
}

export function AddTaskForm({ pending, onAdd }: AddTaskFormProps) {
  const form = useForm({
    defaultValues: { title: '' },
    onSubmit: async ({ value, formApi }) => {
      await onAdd(value.title)
      formApi.reset()
    },
  })

  return (
    <form
      className="add-form"
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
          return (
            <div className="field">
              <label className="sr-only" htmlFor="new-task-title">
                Task title
              </label>
              <input
                id="new-task-title"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Add a task for today"
                autoComplete="off"
                disabled={pending}
              />
              {error ? <p className="field-error">{fieldErrorText(error)}</p> : null}
            </div>
          )
        }}
      </form.Field>
      <button type="submit" disabled={pending}>
        Add
      </button>
    </form>
  )
}
