export type PostItColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  color: PostItColor;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
