import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TASKS_STORAGE_KEY } from './local-storage-repository.ts'
import { getTaskRepository } from './repository.ts'
import type { TaskPatch } from './types.ts'

export function taskQueryKey(date: string) {
  return ['tasks', date] as const
}

export function useTasks(date: string) {
  return useQuery({
    queryKey: taskQueryKey(date),
    queryFn: () => getTaskRepository().listByDate(date),
  })
}

export function useCreateTask(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => getTaskRepository().create({ title, date }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKey(date) })
    },
  })
}

export function useUpdateTask(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; patch: TaskPatch }) =>
      getTaskRepository().update(input.id, input.patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKey(date) })
    },
  })
}

export function useDeleteTask(date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getTaskRepository().delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKey(date) })
    },
  })
}

export function useSyncTasksAcrossTabs() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === TASKS_STORAGE_KEY || event.key === null) {
        void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [queryClient])
}
