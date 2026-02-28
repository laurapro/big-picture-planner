import { useState, useCallback, useEffect } from 'react';
import { TodoItem } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';

export const useTodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) {
        setTodos(data.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
        })));
      }
    };
    fetchTodos();

    const channel = supabase
      .channel('todo_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todo_items' }, () => {
        fetchTodos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addTodo = useCallback(async (text: string) => {
    await supabase.from('todo_items').insert({ text });
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await supabase.from('todo_items').update({ completed: !todo.completed }).eq('id', id);
    }
  }, [todos]);

  const removeTodo = useCallback(async (id: string) => {
    await supabase.from('todo_items').delete().eq('id', id);
  }, []);

  return { todos, addTodo, toggleTodo, removeTodo };
};
