
import { Component, OnInit } from '@angular/core';


import { Task } from '../Models/task.model';
import { TaskService } from '../services/task.service';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
pieChartLabels: any = ['Terminées', 'En cours']; 
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };
  pieChartData: ChartData<'pie', number[], any> = {  
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4caf50', '#2196f3']
      }
    ]
  };

  barChartLabels: any = ['Haute', 'Moyenne', 'Basse']; 
  barChartType: ChartType = 'bar';
  barChartOptions: ChartOptions = {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } }
  };
  barChartData: ChartData<'bar', number[], any> = {  
    labels: this.barChartLabels,
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Tâches en cours par priorité',
        backgroundColor: '#42a5f5'
      }
    ]
  };

  tasks: Task[] = [];
  dataSource = new MatTableDataSource<Task>();
  newTask: Task = this.initTask();
  searchTerm: string = '';
  isEditing: boolean = false;
  columns: string[] = ['name', 'description', 'priority', 'deadline', 'status', 'actions'];

  pageIndex = 0;
  pagedTasks: Task[] = [];
pageSize = 5;
currentPage = 0;


  constructor(private taskService: TaskService) {}

  ngOnInit(): void {

    
    this.loadTasks();
     this.updateCharts();
  }

  initTask(): Task {
    return {
      name: '',
      description: '',
      priority: 'Moyenne',
      deadline: new Date(),
      completed: false
    };
  }

  loadTasks(): void {
    const localData = localStorage.getItem('tasks');
    if (localData) {
      this.tasks = JSON.parse(localData);
      this.updateDataSource();
    } else {
      this.taskService.getTasks().subscribe(tasks => {
        this.tasks = tasks;
        this.updateDataSource();
        this.saveToLocalStorage();
      });
    }
  }

  saveToLocalStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  addOrUpdateTask(): void {
    if (!this.newTask.name || !this.newTask.priority || !this.newTask.deadline) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    if (this.isEditing && this.newTask.id !== undefined) {
      this.taskService.updateTask(this.newTask).subscribe(updatedTask => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.saveToLocalStorage();
        this.resetForm();
        Swal.fire('Succès', 'Tâche modifiée avec succès.', 'success');
        this.updateDataSource();
      });
    } else {
      this.taskService.addTask(this.newTask).subscribe(addedTask => {
        this.tasks.push(addedTask);
        this.saveToLocalStorage();
        this.resetForm();
        Swal.fire('Succès', 'Tâche ajoutée avec succès.', 'success');
        this.updateDataSource();
      });
    }
  }

  resetForm(): void {
    this.newTask = this.initTask();
    this.isEditing = false;
  }

  deleteTask(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action est irréversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(id).subscribe(() => {
          this.tasks = this.tasks.filter(task => task.id !== id);
          this.saveToLocalStorage();
          Swal.fire('Supprimé', 'Tâche supprimée avec succès.', 'success');
          this.updateDataSource();
        });
      }
    });
  }

  markAsCompleted(task: Task): void {
    task.completed = true;
    this.taskService.updateTask(task).subscribe(() => {
      this.saveToLocalStorage();
      Swal.fire('Terminé', `Tâche "${task.name}" marquée comme terminée.`, 'success');
      this.updateDataSource();
    });
  }

  editTask(task: Task): void {
    this.newTask = { ...task };
    this.isEditing = true;
  }

  sortByPriority(): void {
    const priorities = { 'Haute': 3, 'Moyenne': 2, 'Basse': 1 };
    this.tasks.sort((a, b) => priorities[b.priority] - priorities[a.priority]);
    this.saveToLocalStorage();
    this.updateDataSource();
  }

  sortByDeadline(): void {
    this.tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    this.saveToLocalStorage();
    this.updateDataSource();
  }

 get filteredTasks(): Task[] {
  const filtered = this.tasks.filter(task =>
    task.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(this.searchTerm.toLowerCase())
  );


  const startIndex = this.currentPage * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.pagedTasks = filtered.slice(startIndex, endIndex);

  return filtered;
}
  get tasksEnCours(): number {
    return this.tasks.filter(t => !t.completed).length;
  }

  get tasksTerminees(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  updateDataSource(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.dataSource.data = this.filteredTasks.slice(start, end);
  }
onPageChange(event: PageEvent): void {
  this.pageSize = event.pageSize;
  this.currentPage = event.pageIndex;
  this.filteredTasks; 
}


  updateCharts(): void {
    const terminees = this.tasksTerminees;
    const enCours = this.tasksEnCours;
    this.pieChartData.datasets[0].data = [terminees, enCours];

    const countHaute = this.tasks.filter(t => !t.completed && t.priority === 'Haute').length;
    const countMoyenne = this.tasks.filter(t => !t.completed && t.priority === 'Moyenne').length;
    const countBasse = this.tasks.filter(t => !t.completed && t.priority === 'Basse').length;
    this.barChartData.datasets[0].data = [countHaute, countMoyenne, countBasse];
  }


}
