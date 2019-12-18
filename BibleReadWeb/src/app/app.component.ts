import { Component } from '@angular/core';
import { BibleService } from './bible.service';
import { Observable, merge } from 'rxjs';
import 'rxjs/add/operator/map';
import { map } from 'rxjs-compat/operator/map';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { async } from 'q';


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
   chapterNumberStart: string;
   chapterNumberEnd: string;
   ranges: string;
   bibleBooks = [];
   plans = ["Regular", "One Year", "The Writings of Moses", "Israel enters the promised land", "When the kings ruled Isreal", "The Jews return from exile", "Books of songs and practical wisdom", "The Prophets", "Accounts of Jesus\' Life and Ministry", "Growth of the christian congregation", "The letters of paul", "The writings of other apostles and disciples"]
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



   constructor(private bibleService: BibleService, private afs: AngularFirestore, private db: AngularFireDatabase) { }



   ngOnInit() {

      // this.languagesData.forEach(language => {
      //    this.getLanguages(`${language.url}json/html`, language.name);
      // })

      //this.loadReadinPlans();

      this.loadPlans()
      // this.loadRegularPlan()

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

   loadRegularPlan() {
      let totaldays = 0;
      let totalChapters = 0;

      this.bibleService.fetchData().subscribe((d) => {
         //console.log(d.editionData.books);

         this.db.database.ref('/plans').child(`0`).set({
            index: 0,
            isRead: false,
            name: 'regular',
            numberDaysTotal: totaldays
         });

         for (var i = 1; i <= 66; i++) {

            this.bibleBooks.push(d.editionData.books[`${i}`])
            totalChapters = Number(d.editionData.books[`${i}`].chapterCount)
            totaldays += totalChapters;

            this.db.database.ref('/plans').child(`0`).child('list').child(`${i}`).set({
               bookName: d.editionData.books[`${i}`].standardName,
               bookNumber: i,
               isRead: false,
            })

            for (var x = 1; x <= totalChapters; x++) {
               this.db.database.ref('/plans').child(`0`).child('list').child(`${i}`).child('chapters').child(`${x}`).set({
                  chapters: x,
                  isRead: false
               })
            }
         }
      });
   }

   formatChapters(chapters: string, number: number): string {
      let chapterNumEnd = '';
      let chapterNumStart = chapters.split(' ')[0];
      let bookNumber;

      if (String(chapters).split(' ').length == 3) {

         chapterNumEnd = String(chapters).split(' ')[2]

      } else {
         chapterNumEnd = String(chapters).split(' ')[0]
      }

      if (number < 10) {
         bookNumber = `0${number}`;
      } else {
         bookNumber = `${number}`;
      }

      if (Number(chapterNumStart) < 10) {
         chapterNumStart = `00${chapterNumStart}`;
      } else if (Number(chapterNumStart) < 100) {
         chapterNumStart = `0${chapterNumStart}`;
      } else {
         chapterNumStart = `${chapterNumStart}`;
      }
      if (Number(chapterNumEnd) < 10) {
         chapterNumEnd = `00${chapterNumEnd}`;
      } else if (Number(chapterNumEnd) < 100) {
         chapterNumEnd = `0${chapterNumEnd}`;
      } else {
         chapterNumEnd = `${chapterNumEnd}`;
      }
      return `${bookNumber + chapterNumStart}001-${bookNumber + chapterNumEnd}999`;

   }


   loadReadinPlans() {

      this.bibleService.fetchReadingPlan().subscribe(plan => {

         for (var x = 1; x <= 66; x++) {
            const filteredPlan = plan.filter(item => {
               return item.bookNumber == x
            });

            console.log(filteredPlan);

            for (var i = 1; i <= filteredPlan.length; i++) {

               this.db.database.ref('/plans').child('1').child('list').child(`${x}`).child('chapters').child(`${i}`).set({
                  chapters: filteredPlan[i - 1].chapters,
                  isRead: false,
                  range: this.formatChapters(filteredPlan[i - 1].chapters, filteredPlan[i - 1].bookNumber)
               })
            }
         }
         console.log(plan);
      })

   }

   loadPlans() {

      this.bibleService.fetchPlans().subscribe(plan => {
         // console.log(plan)
         let unique = [];
         let temp = []
         let filteredPlans = []
         let bookCount: number;


            for (var i = 1; i <= 10; i++) {

               let filteredPlan = plan.filter(item => { return item.planNumber == i })
               filteredPlans.push(filteredPlan)
        
            }

               filteredPlans.filter(item => {
                  for (var x = 1; x <= 66; x++) {
                     if (item.bookNumber == x) {
                        temp.push(item.bookNumber);
          
                       bookCount = temp.filter((elem, index, self) => {
                           return index === self.indexOf(elem);
                        }).length
                        
                     }
                  }
               })
            

            console.log(filteredPlans, bookCount)


               // console.log(filteredPlan)
               // dayCount = filteredPlan.length
               // unique.push({id: i+1, bookCount: bookCount});


            // for (var z = 0; z <= unique[i - 1].bookCount; z++) {
            //    for (var x = 0; x <= filteredPlan.length; x++) {

            //    console.log(unique.length, filteredPlan.length)
            // this.db.database.ref('/plans').child(`${unique[i - 1].id}`).child('list').child(`${z + 1}`).set({
            //    //bookNumber: filteredPlan[x].bookNumber,
            //    isRead: false,
            //  //  bookName: filteredPlan[x].bookName
            // });
            //    }
              
            // }


      });  
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

