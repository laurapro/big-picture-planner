export type PostItColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'black';

export interface CalendarEvent {
  id: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  title: string;
  color: PostItColor;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
