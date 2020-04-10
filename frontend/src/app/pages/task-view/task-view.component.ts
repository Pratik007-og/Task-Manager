import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute,Params, Router } from '@angular/router';
import {List} from '../../models/list_model'
import {Task} from '../../models/task_model'

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  
  lists: List[];
  tasks: Task[];

  selectedListId: string;

  constructor(private taskservice: TaskService, private route:ActivatedRoute, private router: Router) { }

  ngOnInit(): void{
    this.route.params.subscribe(
      (params: Params)=>{
        if(params.listid){
          this.selectedListId= params.listid;
        this.taskservice.getTasks(params.listid).subscribe((tasks: Task[])=>{
          this.tasks = tasks;
        })
      }else{
        this.tasks = undefined;
      }
      }
      
    )
    this.taskservice.getLists().subscribe((lists: List[])=>{
      //console.log(lists);
      this.lists = lists;
    })
      
    }

    onTaskClick(task: Task){
      //we want to set the task to completed
      this.taskservice.complete(task).subscribe(()=>{
        console.log('completed successfully');
        task.completed = !task.completed;
      });
    }
    onDeleteList(){
      this.taskservice.deleteList(this.selectedListId).subscribe((res: any)=>{
        this.router.navigate(['/lists']);
        console.log(res);
      })
    }
    onDeleteTask(id: string){
      this.taskservice.deleteTask(this.selectedListId, id).subscribe((res: any)=>{
        this.tasks = this.tasks.filter(val => val._id !== id);
        console.log(res);
      })
    }
  

}
