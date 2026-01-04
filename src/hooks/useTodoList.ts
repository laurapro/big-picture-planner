import { useState, useCallback } from 'react';
import { TodoItem } from '@/types/calendar';

const STORAGE_KEY = 'big-ass-calendar-todos';

const loadTodos = (): TodoItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTodos = (todos: TodoItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

export const useTodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>(loadTodos);

  const addTodo = useCallback((text: string) => {
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    };
    setTodos((prev) => {
      const updated = [...prev, newTodo];
      saveTodos(updated);
      return updated;
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      saveTodos(updated);
      return updated;
    });
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTodos(updated);
      return updated;
    });
  }, []);

  return { todos, addTodo, toggleTodo, removeTodo };
};
