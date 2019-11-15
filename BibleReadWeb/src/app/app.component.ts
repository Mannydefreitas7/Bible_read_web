import { Component } from '@angular/core';
import { BibleService } from './bible.service';
import { Observable, merge } from 'rxjs';
import 'rxjs/add/operator/map';
import { map } from 'rxjs-compat/operator/map';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';

 
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
  chapters: string;
  bookNumber: string;
  chapterNumberStart:  string;
  chapterNumberEnd:  string;
  ranges: string;
  bibleBooks = [];
  languagesData = [
  {
     name: 'Hindi',
     url: 'https://www.jw.org/hi/प्रकाशन/बाइबल/nwt/किताबें/'
  }, 
  {
     name: 'Korean',
     url: 'https://www.jw.org/ko/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC/%EC%84%B1%EA%B2%BD/nwt/%EB%AA%A9%EC%B0%A8/'
  }
]
  books: BibleData;



constructor(private bibleService: BibleService, private afs: AngularFirestore, private db: AngularFireDatabase) {}



ngOnInit() {
 
// this.languagesData.forEach(language => {
//    this.getLanguages(`${language.url}json/html`, language.name);
// })

// this.loadReadinPlans();

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

            this.db.database.ref('/bible').child(`${i}`).set({
               book_number_data: this.bookNumberData,
               book_number_html: `${i}`,
               hasAudio: d.editionData.books[i].hasAudio,
               short_name: d.editionData.books[i].officialAbbreviation,
               total_chapters: d.editionData.books[i].chapterCount
            }) 
            
            // .database.ref('/bible').push({
            //    book_number_data: this.bookNumberData,
            //    book_number_html: `${i}`,
            //    hasAudio: d.editionData.books[i].hasAudio,
            //    short_name: d.editionData.books[i].officialAbbreviation,
            //    total_chapters: d.editionData.books[i].chapterCount
            // })

            // this.afs.collection('bible').doc(`${i}`).set({
            //    book_number_data: this.bookNumberData,
            //    book_number_html: `${i}`,
            //    hasAudio: d.editionData.books[i].hasAudio,
            //    short_name: d.editionData.books[i].officialAbbreviation,
            //    total_chapters: d.editionData.books[i].chapterCount
            // }, { merge: false });
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


               this.db.database.ref('/bible').child(`${i}`).child('chapters').child(`${x}`).set({
                  chapter_number_data: this.bookChapters,
                  chapter_number_html: `${x}`,
                  range: `${this.bookNumberData + this.bookChapters}001-${this.bookNumberData + this.bookChapters}999`,
               });

            }

         }
      });

   }

   loadReadinPlans() {

   this.db.database.ref('/plans').child('regular').set({
      numberDaysTotal: 365,
      name: 'regular',
      isRead: false
   });
   
   this.bibleService.fetchReadingPlan().subscribe(plan => {
     
      for (var i = 1; i <= 365; i++) { 
         var chapterNumEnd = ''
         const chapterNumberStart = String(plan[i - 1].chapters).split(' ')[0]

         if (String(plan[i - 1].chapters).split(' ').length == 3) {

            chapterNumEnd = String(plan[i - 1].chapters).split(' ')[2]

         } else {
            chapterNumEnd = String(plan[i - 1].chapters).split(' ')[0]
         }
         
         const bookNumber = plan[i - 1].bookNumber
         
         if (bookNumber < 10) {
            this.bookNumber = `0${bookNumber}`;
         } else {
            this.bookNumber = `${bookNumber}`;
         }

         if (Number(chapterNumberStart) < 10) {
            this.chapterNumberStart = `00${chapterNumberStart}`;
         } else if (Number(chapterNumberStart) < 100) {
            this.chapterNumberStart = `0${chapterNumberStart}`;
         } else {
            this.chapterNumberStart = `${chapterNumberStart}`;
         } 
         if (Number(chapterNumEnd) < 10) {
            this.chapterNumberEnd = `00${chapterNumEnd}`;
         } else if (Number(chapterNumEnd) < 100) {
            this.chapterNumberEnd = `0${chapterNumEnd}`;
         } else {
            this.chapterNumberEnd = `${chapterNumEnd}`;
         }
       

         this.db.database.ref('/plans').child('regular').child('days').child(`${i}`).set({
            id: `${i}`,
            bookNumber: plan[i - 1].bookNumber,
            bookName: plan[i - 1].bookName,
            chapters: plan[i - 1].chapters,
            range: `${this.bookNumber + this.chapterNumberStart}001-${this.bookNumber + this.chapterNumberEnd}999`,
            isRead: false
         });
      }
   
   })
         
   }

   getLanguages(url: string, language: string) {

   this.bibleService.fetchLocaleData(url).subscribe(locale => {
      this.db.database.ref('/languages').child(`${locale.editionData.locale}`).set({
         name: language,
         locale: locale.editionData.locale,
         audioLocale: locale.editionData.locale.charAt(0).toUpperCase(),
         url: `${locale.editionData.url}json/html`
      });

      for (var i = 1; i <= 66; i++) {
 
         this.db.database.ref('/languages').child(`${locale.editionData.locale}`).child('bible_book').child(`${i}`).set({
               index: i,
               long_name: locale.editionData.books[i].standardName,
               short_name: locale.editionData.books[i].officialAbbreviation
           });
      }
      
   })

   }



}

