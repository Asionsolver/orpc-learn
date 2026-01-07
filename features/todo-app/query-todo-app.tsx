"use client";

import React, { useState } from "react";
import { client } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardList, Clock, Loader2, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Skeleton from "@/components/ui/skeleton";

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
  createdAt: string;
  updatedAt?: string;
}

const QueryTodoApp = () => {
  const [newTitle, setNewTitle] = useState("");
  const queryClient = useQueryClient();
  const [inputError, setInputError] = useState<string | null>(null); // input error state
  const [editingId, setEditingId] = useState<number | null>(null); // No Todo is being edited
  const [editValue, setEditValue] = useState(""); // Input value of edit mode
  //  Fetch Todos (type set to <Todo[]>)
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: () => client.getTodos() as Promise<Todo[]>,
  });

  // ADD Mutation
  const addMutation = useMutation<Todo, Error, string, AddTodoContext>({
    mutationFn: (title: string) => client.addTodo({ title }) as Promise<Todo>,

    onMutate: async (newTodoTitle): Promise<AddTodoContext> => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      const tempId = Date.now();
      const tempTodo: Todo = {
        id: tempId,
        title: newTodoTitle,
        completed: false,
        createdAt: new Date().toISOString(),
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

  //   UPDATE Mutation (To edit the title)
  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      client.updateTodo({ id, title }) as Promise<Todo>,
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((t) =>
          t.id === id ? { ...t, title, updatedAt: new Date().toISOString() } : t
        )
      );
      return { previousTodos };
    },
    onSuccess: () => setEditingId(null),
    onError: (_, __, context) =>
      queryClient.setQueryData(["todos"], context?.previousTodos),
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
    if (!newTitle.trim()) {
      setInputError("Task title cannot be empty!"); // এরর মেসেজ সেট করা
      return;
    }
    setInputError(null);
    addMutation.mutate(newTitle);
    setNewTitle("");
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.title);
  };

  const handleUpdate = (id: number) => {
    if (!editValue.trim()) return;
    updateMutation.mutate({ id, title: editValue });
  };

  // Time formatting function
  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString([], {
      month: "short", // Example: Oct
      day: "numeric", // Example: 26
      hour: "2-digit", // Example: 10
      minute: "2-digit", // Example: 30
      hour12: true, // AM/PM Formate
    });
  };
  return (
    <Card className="w-full max-w-md mx-auto mt-10 shadow-xl border-t-4 border-t-primary overflow-hidden ">
      <CardHeader className="pb-4 border-b bg-slate-50/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Smart Tasks
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-2 mb-6">
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="What needs to be done?"
              className={
                inputError
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "bg-slate-50"
              }
            />
            <Button type="submit" disabled={addMutation.isPending}>
              Add
            </Button>
          </div>
          {inputError && (
            <p className="text-xs text-red-500 font-medium ml-1">
              {inputError}
            </p>
          )}
        </form>

        {/* List section - with scroll and skeleton */}
        {isLoading ? (
          <Skeleton />
        ) : todos.length === 0 ? (
          <div className="text-center py-10 opacity-30 flex flex-col items-center">
            <ClipboardList className="w-12 h-12 mb-2" />
            <p className="font-medium">No tasks yet</p>
          </div>
        ) : (
          <div
            className="max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent transition-all"
            style={{ scrollbarWidth: "thin" }}
          >
            <ul className="space-y-4 pb-2">
              {[...todos].reverse().map(
                (
                  todo // reverse() to show the new task above.
                ) => (
                  <li
                    key={todo.id}
                    className="group border rounded-lg p-3 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {editingId === todo.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600"
                            onClick={() => {
                              if (editValue.trim())
                                updateMutation.mutate({
                                  id: todo.id,
                                  title: editValue,
                                });
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-3 flex-1"
                          onDoubleClick={() => {
                            setEditingId(todo.id);
                            setEditValue(todo.title);
                          }}
                        >
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() =>
                              toggleMutation.mutate(todo.id)
                            }
                          />
                          <span
                            className={`flex-1 cursor-pointer select-none text-sm ${
                              todo.completed
                                ? "line-through text-slate-400"
                                : "font-medium text-slate-700"
                            }`}
                          >
                            {todo.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-red-50"
                            onClick={() => deleteMutation.mutate(todo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Created: {formatDateTime(todo.createdAt)}</span>
                      </div>
                      {todo.updatedAt && (
                        <div className="flex items-center gap-1 text-blue-500 font-medium">
                          <Check className="w-3 h-3" />
                          <span>Updated: {formatDateTime(todo.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryTodoApp;
