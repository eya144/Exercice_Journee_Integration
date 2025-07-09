export interface Task {
    id?: number; 
  name: string;
  description: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
  deadline: Date;
  completed: boolean;
}