import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { TodoItem } from '@/types/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TodoListProps {
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
}

export const TodoList = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onRemoveTodo,
}: TodoListProps) => {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <section className="w-full max-w-2xl mx-auto bg-card rounded-2xl shadow-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold">To-Do</h2>
        {todos.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {completedCount}/{todos.length} done
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 h-11"
        />
        <Button type="submit" size="icon" className="h-11 w-11" disabled={!newTodo.trim()}>
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {todos.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No tasks yet. Add one above!
        </p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li
              key={todo.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg bg-secondary/50 group animate-fade-in transition-all',
                todo.completed && 'opacity-60'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                  todo.completed
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/40 hover:border-primary'
                )}
              >
                {todo.completed && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
              </button>
              <span
                className={cn(
                  'flex-1 text-sm transition-all',
                  todo.completed && 'line-through text-muted-foreground'
                )}
              >
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveTodo(todo.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
