import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import {Task} from './models/task_model'

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqservice: WebRequestService) { }

  createList(title: string){
    //we want to send a request to create a list
   return this.webReqservice.post('lists',{title});
  }
  getLists(){
    return this.webReqservice.get('lists');
  }

  createTask(listid: string,title: string){
    //we want to send a request to create a list
    return this.webReqservice.post(`lists/${listid}/tasks`,{title});
  }
  getTasks(listid: string){
    return this.webReqservice.get(`lists/${listid}/tasks`);
  }
  complete(task:Task){
    return this.webReqservice.patch(`lists/${task._listid}/tasks/${task._id}`,{
      completed: !task.completed
    });
  }
  deleteList(id: string){
    return this.webReqservice.delete(`lists/${id}`);
  }
  updateList(id: string, title: string){
    return this.webReqservice.patch(`lists/${id}`, {title});
  }
  deleteTask(listid: string,taskid: string){
    return this.webReqservice.delete(`lists/${listid}/tasks/${taskid}`);
  }
  updateTask(listid: string, taskid: string, title: string){
    return this.webReqservice.patch(`lists/${listid}/tasks/${taskid}`, {title});
  }
}
