import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-editlist',
  templateUrl: './editlist.component.html',
  styleUrls: ['./editlist.component.scss']
})
export class EditlistComponent implements OnInit {
  listid: any;

  constructor(private route: ActivatedRoute, private taskService:TaskService, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params:Params)=>{
        this.listid = params['listid'];
      }
    )
  }
  UpdateList(title: string){
    this.taskService.updateList(this.listid, title).subscribe((res)=>{
      console.log(res);
      this.router.navigate(['/lists',this.listid]);
    })
  }

}
