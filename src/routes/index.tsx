import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ListTodoIcon, PlusIcon } from 'lucide-react'
import { db } from '@/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const serverLoader = createServerFn({
  method: 'GET',
}).handler(() => {
  return db.query.todos.findMany()
})

export const Route = createFileRoute('/')({
  component: App,
  loader: () => {
    return serverLoader()
  },
})

function App() {
  const data = Route.useLoaderData()
  console.log({ data })

  const totalTodos = data.length
  const completedTodos = data.filter((todo) => todo.isCompleted).length

  return (
    <div className="min-h-screen container space-y-8">
      <div className="flex justify-center items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Todos List</h1>
          {totalTodos > 0 && (
            <Badge variant="outline">
              {completedTodos} of {totalTodos} completed
            </Badge>
          )}
        </div>
        <div>
          <Button asChild size="sm">
            <Link to="/todos/new">
              <PlusIcon />
              Add New Todo
            </Link>
          </Button>
        </div>
      </div>
      <TodosListTable todos={data} />
    </div>
  )
}

function TodosListTable({
  todos,
}: {
  todos: Array<{
    id: number
    title: string
    isCompleted: boolean
    createdAt: Date
  }>
}) {
  if (todos.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListTodoIcon className="h-12 w-12" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyTitle>No todos found</EmptyTitle>
        <EmptyDescription>Add your first todo!</EmptyDescription>
        <EmptyContent>
          <Button asChild size="sm">
            <Link to="/todos/new">
              <PlusIcon />
              Add New Todo
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead></TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.map((todo) => (
          <ToDoTableRow key={todo.id} todo={todo} />
        ))}
      </TableBody>
    </Table>
  )
}

function ToDoTableRow({
  todo,
}: {
  todo: { id: number; title: string; isCompleted: boolean; createdAt: Date }
}) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={todo.isCompleted} />
      </TableCell>
      <TableCell
        className={cn(
          'font-medium',
          todo.isCompleted ? 'text-muted-foreground line-through' : '',
        )}
      >
        {todo.title}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(todo.createdAt)}
      </TableCell>
      <TableCell>
        <Button asChild size="sm">
          <Link to={`/todos/${todo.id}/edit`}>Edit</Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  })
  return formatter.format(date)
}
