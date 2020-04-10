import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit {
  taskid: string;
  listid: string;

  constructor(private route: ActivatedRoute, private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params:Params)=>{
        this.taskid = params.taskid;
        this.listid = params.listid;
      }
    )
  }
  UpdateTask(title: string){
    this.taskService.updateTask(this.listid,this.listid, title).subscribe((res)=>{
      console.log(res);
      this.router.navigate(['/lists',this.listid]);
      
    })
  }

}
