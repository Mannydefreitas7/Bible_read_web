import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import 'rxjs/add/operator/map';
 
@Injectable({
  providedIn: 'root'
})
export class BibleService {

  constructor(private http: HttpClient, private afs: AngularFirestore) { }

  fetchData(): Observable<any> {
      return this.http.get('https://cors-anywhere.herokuapp.com/https://www.jw.org/en/library/bible/nwt/books/json/');
  }

  fetchLocaleData(urlLocale: string): Observable<any> {
    return this.http.get(`https://cors-anywhere.herokuapp.com/${urlLocale}`)
  }

  fetchReadingPlan(): Observable<any> {
    return this.http.get('../../assets/data/ReadingPlans.json')
  }

  getReadingPlan(): Observable<any> {
    return this.afs.collection('plans').doc('regular').collection('plan').valueChanges();
  }
 
}
