import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupComponent } from './pages/signup/signup.component';
import { EditlistComponent } from './pages/editlist/editlist.component';
import { EditTaskComponent } from './pages/edit-task/edit-task.component';


const routes: Routes = [
  
    {path: '',redirectTo:'lists',pathMatch:'full'},
    {path: 'new-list', component: NewListComponent},
    {path:'lists/:listid',component: TaskViewComponent},
    {path:'lists',component: TaskViewComponent},
    {path:'lists/:listid/new-task',component:NewTaskComponent},
    {path: 'login', component: LoginPageComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'edit-list/:listid', component: EditlistComponent},
    {path: 'lists/:listid/edit-task/:taskid', component: EditTaskComponent},
    

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
