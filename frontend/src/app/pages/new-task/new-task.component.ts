import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {Task} from '../../models/task_model'

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(private taskservice: TaskService,private route: ActivatedRoute,private router: Router) { }
  public listid;
  ngOnInit(): void {
    this.route.params.subscribe(
      (params:Params)=>{
        this.listid = params['listid'];
      }
    )
  }
  createTask(title: string){
    this.taskservice.createTask(this.listid,title).subscribe((task: Task)=>{
      console.log(task);
    })
    this.router.navigate(['/lists',this.listid]);
    

  }

}
