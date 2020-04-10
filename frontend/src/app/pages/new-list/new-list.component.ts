import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { Router } from '@angular/router';
import {List} from '../../models/list_model'

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(private taskservice: TaskService, private router: Router) { }

  ngOnInit(): void {
  }

  createList(title: string){
    this.taskservice.createList(title).subscribe((list: List)=>{
      console.log(list);
      //now we navigate to lists/:listid
      this.router.navigate(['/lists',list._id]);
    });
  }
}
