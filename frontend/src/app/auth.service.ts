import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { shareReplay,tap } from "rxjs/operators";
import { HttpResponse, HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private webReqService:WebRequestService, private router:Router, private http:HttpClient) { }

  login(email:string, password:string ){
    return this.webReqService.login(email,password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        //the auth tokens will be in the header of this response
        this.setSession(res.body._id, res.headers.get('x-access-token'),res.headers.get('x-refresh-token'));
        console.log("Logged in");
        
      })
    )
  }

  logout(){
    this.removeSession();

    this.router.navigate(['/login']);
  }

  signup(email:string, password:string ){
    return this.webReqService.signup(email,password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        //the auth tokens will be in the header of this response
        this.setSession(res.body._id, res.headers.get('x-access-token'),res.headers.get('x-refresh-token'));
        console.log("Successfully signed up and now log in ");
        
      })
    )
  }

  getAccessToken(){
    return localStorage.getItem('x-access-token');
  }
  setAccessToken(accessToken){
    localStorage.setItem('x-access-token', accessToken)
  }

  getRefreshToken(){
    return localStorage.getItem('x-refresh-token');

  }

  private setSession(userId:string, accessToken: string, refreshToken: string){
    //to store the headers
    localStorage.setItem('user-id',userId);
    localStorage.setItem('x-access-token',accessToken);
    localStorage.setItem('x-refresh-token',refreshToken);
  }
  private removeSession(){
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getUserId(){
    return localStorage.getItem('user-id');
  }

  getNewAccesstoken(){
    return this.http.get(`${this.webReqService.ROOT_URL}/user/me/access-token`,{
      headers:{
        'x-refresh-token':this.getRefreshToken(),
        '_id':this.getUserId()
      },
      observe:'response'
    }).pipe(
      tap((res: HttpResponse<any>)=>{
        this.setAccessToken(res.headers.get('x-access-token'))
      })
    )
  }

  
}
