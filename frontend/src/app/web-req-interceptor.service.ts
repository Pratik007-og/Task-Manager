import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, empty } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { chainedInstruction } from '@angular/compiler/src/render3/view/util';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor{

  constructor(private authService: AuthService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler):Observable<any>{
    //handle the request
    request = this.addAuthHeader(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse)=>{
        

        if(error.status === 401){
          
          console.log('test');
          //so we are unauthorized
          //refresh the access token
          return this.refreshAccessToken().pipe(
            switchMap(()=>{
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((_err: any)=>{
              console.log(_err);
              this.authService.logout();
              return empty();
            })
          )
        }

        return throwError(error);
      })
      
    )
  }
  addAuthHeader(request: HttpRequest<any>){
    //get the access token
    const token = this.authService.getAccessToken();

    if(token){
          //append the access token to the req header
          return request.clone({
            setHeaders:{
              'x-access-token': token
            }
          })
    }
    return request;
  }
  refreshAccessToken(){
    return this.authService.getNewAccesstoken().pipe(
      tap(()=>{
        console.log('access token refreshed');
      })
    )
  }
}
