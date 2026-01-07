"use client";

import React, { useState } from "react";
import { client } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
// First define the type of Context.
interface AddTodoContext {
  previousTodos: Todo[] | undefined;
  tempId: number;
}
// ! Todo type defined
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const QueryTodoApp = () => {
  const [newTitle, setNewTitle] = useState("");
  const queryClient = useQueryClient();

  //  Fetch Todos (type set to <Todo[]>)
  const {
    data: todos = [],
    isLoading,
    isFetching,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: () => client.getTodos(),
  });

  // ADD Mutation
  const addMutation = useMutation<Todo, Error, string, AddTodoContext>({
    mutationFn: (title: string) => client.addTodo({ title }),

    onMutate: async (newTodoTitle): Promise<AddTodoContext> => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      const tempId = Date.now();
      const tempTodo: Todo = {
        id: tempId,
        title: newTodoTitle,
        completed: false,
      };

      queryClient.setQueryData<Todo[]>(["todos"], (old) => [
        ...(old || []),
        tempTodo,
      ]);

      return { previousTodos, tempId };
    },

    onSuccess: (newTodoFromServer, _variables, context) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) => {
        if (!old) return [];
        return old.map((todo) =>
          todo.id === context?.tempId ? newTodoFromServer : todo
        );
      });
    },

    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
    },
  });

  // TOGGLE Mutation
  const toggleMutation = useMutation({
    mutationFn: (id: number) => client.toggleTodo({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
    },
  });

  // DELETE Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.deleteTodo({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.filter((todo) => todo.id !== id)
      );

      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMutation.mutate(newTitle);
    setNewTitle("");
  };

  return (
    <Card className="max-w-md mx-auto mt-10 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">oRPC Tasks</CardTitle>
          {isFetching && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
          />
          <Button type="submit" disabled={addMutation.isPending}>
            Add
          </Button>
        </form>

        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="animate-spin mx-auto" />
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>No tasks yet!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleMutation.mutate(todo.id)}
                  />
                  <span
                    className={
                      todo.completed
                        ? "line-through text-muted-foreground"
                        : "font-medium"
                    }
                  >
                    {todo.title}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => deleteMutation.mutate(todo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryTodoApp;
