import { useRef, useState } from 'react'
import { Loader, PlusIcon } from 'lucide-react'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import z from 'zod'
import { redirect } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { LoadingSwap } from './ui/loading-swap'
import type { FormEvent } from 'react'
import { db } from '@/db'
import { todos } from '@/db/schema'

const addTodoServerFn = createServerFn({
  method: 'POST',
})
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db.insert(todos).values({
      title: data.name,
      isCompleted: false,
    })
    throw redirect({ to: '/' })
  })

const updateTodoServerFn = createServerFn({
  method: 'POST',
})
  .inputValidator(z.object({ id: z.string().min(1), title: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db.update(todos).set(data).where(eq(todos.id, data.id))
    throw redirect({ to: '/' })
  })

export function TodoForm({
  todo,
}: {
  todo?: {
    title: string
    id: string
  }
}) {
  const nameRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const addTodoFn = useServerFn(addTodoServerFn)
  const updateTodoFn = useServerFn(updateTodoServerFn)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const name = nameRef.current?.value.trim()
    if (!name) {
      return
    }
    setIsLoading(true)
    if (todo == null) {
      await addTodoFn({ data: { name } })
    } else {
      await updateTodoFn({ data: { title: name, id: todo.id } })
    }
    setIsLoading(false)
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Input
        ref={nameRef}
        autoFocus
        placeholder="Enter todo title"
        className="flex-1"
        aria-label="Name"
        defaultValue={todo?.title}
      />
      <Button type="submit" className="ml-2 w-18" disabled={isLoading}>
        <LoadingSwap isLoading={isLoading} className="flex gap-2 items-center">
          {todo == null ? (
            <>
              <PlusIcon /> Add
            </>
          ) : (
            'Update'
          )}
        </LoadingSwap>
      </Button>
    </form>
  )
}
