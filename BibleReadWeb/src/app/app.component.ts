import { Component } from '@angular/core';
import { BibleService } from './bible.service';
import { Observable, merge } from 'rxjs';
import 'rxjs/add/operator/map';
import { map } from 'rxjs-compat/operator/map';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BibleReadWeb';
  bible: Observable<any>;
  bookNumberData: string;
  bookChapters: String;
  bibleBooks = [];
  books: BibleData;

constructor(private bibleService: BibleService, private afs: AngularFirestore) {}

ngOnInit() {
   this.bibleService.fetchData().subscribe(d => {
      console.log(d.editionData.books['1']);
      for (var i = 1; i <= 66; i++) {  
         this.bibleBooks.push(d.editionData.books[i]);
      }
   });

  // this.loadBibleBooks();
 // this.loadBibleBookChapters();
}

loadBibleBooks() {

      this.bibleService.fetchData().subscribe(d => {
         console.log(d.editionData.books['1']);

          for (var i = 1; i <= 66; i++) {  
            this.bibleBooks.push(d.editionData.books[i])

            if (i < 10) {
               this.bookNumberData = `0${i}`;
            } else {
               this.bookNumberData = `${i}`;
            }

            this.afs.collection('bible').doc(`${i}`).set({
               book_number_data: this.bookNumberData,
               book_number_html: `${i}`,
               hasAudio: d.editionData.books[i].hasAudio,
               short_name: d.editionData.books[i].officialAbbreviation,
               total_chapters: d.editionData.books[i].chapterCount
            }, { merge: false });
         }

         console.log(this.bibleBooks)
      })

}

loadBibleBookChapters() {

      this.bibleService.fetchData().subscribe(d => {
         console.log(d.editionData.books['1']);

          for (var i = 1; i <= 66; i++) {  
            this.bibleBooks.push(d.editionData.books[i])

            if (i < 10) {
               this.bookNumberData = `0${i}`;
            } else {
               this.bookNumberData = `${i}`;
            }

            for (var x = 1; x <= d.editionData.books[i].chapterCount; x++) {

               if (x < 10) {
                  this.bookChapters = `00${x}`;
               } else if (x < 100) {
                  this.bookChapters = `0${x}`;
               } else {
                  this.bookChapters = `${x}`;
               }


               this.afs.collection('bible').doc(`${i}`).collection('chapters').doc(`${x}`).set({
                  chapter_number_data: this.bookChapters,
                  chapter_number_html: `${x}`,
                  range: `${this.bookNumberData + this.bookChapters}001-${this.bookNumberData + this.bookChapters}999`,
               });
            }

         }
      });

   }
 
}

