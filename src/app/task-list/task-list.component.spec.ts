import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../services/task.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgChartsModule } from 'ng2-charts';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTaskService: any;

  const mockTasks = [
    {
      id: 1,
      name: 'Tâche 1',
      description: 'Desc 1',
      priority: 'Haute',
      deadline: new Date(),
      completed: false
    },
    {
      id: 2,
      name: 'Tâche 2',
      description: 'Desc 2',
      priority: 'Basse',
      deadline: new Date(),
      completed: true
    }
  ];

  beforeEach(async () => {
    mockTaskService = {
      getTasks: jasmine.createSpy('getTasks').and.returnValue(of(mockTasks)),
      addTask: jasmine.createSpy('addTask').and.callFake((task: any) => of({ ...task, id: 3 })),
      updateTask: jasmine.createSpy('updateTask').and.callFake((task: any) => of(task)),
      deleteTask: jasmine.createSpy('deleteTask').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        NoopAnimationsModule,
        MatToolbarModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressBarModule,
        NgChartsModule
      ],
      providers: [{ provide: TaskService, useValue: mockTaskService }]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    expect(component.tasks.length).toBe(2);
    expect(component.tasks[0].name).toBe('Tâche 1');
  });

  it('should add a task', () => {
    component.newTask = {
      name: 'Nouvelle tâche',
      description: 'Test add',
      priority: 'Moyenne',
      deadline: new Date(),
      completed: false
    };
    component.addOrUpdateTask();
    expect(mockTaskService.addTask).toHaveBeenCalled();
  });



  
});
