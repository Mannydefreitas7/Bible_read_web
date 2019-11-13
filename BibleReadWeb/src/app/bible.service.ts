import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
 
@Injectable({
  providedIn: 'root'
})
export class BibleService {

  constructor(private http: HttpClient) { }

  fetchData(): Observable<any> {
      return this.http.get('https://cors-anywhere.herokuapp.com/https://www.jw.org/en/library/bible/nwt/books/json/');
  }
 
}
