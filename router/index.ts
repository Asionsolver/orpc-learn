import { ORPCError, os } from "@orpc/server";
import z, { success, uuid } from "zod";
// Todo টাইপ ডিফাইন (টাইপ সেফটির জন্য)
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}
// simple in-memory database
const todos: Todo[] = [
  {
    id: 1,
    title: "Learn oRPC",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export const router = {
  // Get all Todo
  getTodos: os.handler(() => {
    return todos;
  }),

  // create new todo
  addTodo: os
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
      })
    )
    .handler(({ input }) => {
      const newTodo = {
        id: Date.now(),
        title: input.title,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      todos.push(newTodo);
      return newTodo;
    }),

  // Todo টাইটেল আপডেট করা (নতুন যোগ করা হয়েছে)
  updateTodo: os
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, "Title is required"),
      })
    )
    .handler(({ input }) => {
      const todo = todos.find((t) => t.id === input.id);

      if (!todo) {
        throw new ORPCError("NOT_FOUND", {
          message: "Todo not found with this ID",
        });
      }

      todo.title = input.title;
      todo.updatedAt = new Date().toISOString();

      return todo;
    }),

  // Updating Todo status (Toggle)
  toggleTodo: os
    .input(
      z.object({
        id: z.number(),
      })
    )
    .handler(({ input }) => {
      const todo = todos.find((t) => t.id === input.id);

      // proper error handling
      if (!todo) {
        throw new ORPCError("NOT_FOUND", {
          message: "Todo not found with this ID",
        });
      }

      todo.completed = !todo.completed;
      todo.updatedAt = new Date().toISOString();
      return todo;
    }),

  // delete todo

  deleteTodo: os.input(z.object({ id: z.number() })).handler(({ input }) => {
    const index = todos.findIndex((t) => t.id === input.id);
    if (index === -1) {
      throw new ORPCError("NOT_FOUND", {
        message: "Cannot delete: Todo not found",
      });
    }

    todos.splice(index, 1);
    return {
      success: true,
    };
  }),
};
export type AppRouter = typeof router;
