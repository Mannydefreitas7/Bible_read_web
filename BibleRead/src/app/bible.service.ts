import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from '@angular/fire/database';
@Injectable({
   providedIn: 'root'
})
export class BibleService {
   bible: Observable<any>;
   bookNumberData: string;
   bookChapters: String;
   chapters: string;
   bookNumber: string;
   bookNum: number;
   chapterNumberStart: string;
   chapterNumberEnd: string;
   ranges: string;
   filteredPlans = []
   bibleBooks = [];
   plans = ["Regular", "One Year", "", "The Writings of Moses", "Israel enters the promised land", "When the kings ruled Isreal", "The Jews return from exile", "Books of songs and practical wisdom", "The Prophets", "Accounts of Jesus\' Life and Ministry", "Growth of the christian congregation", "The letters of paul", "The writings of other apostles and disciples"]
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

   constructor(private http: HttpClient, private afs: AngularFirestore, private db: AngularFireDatabase) { }

   formatChapters(chapters: string, number: number): string {
      let chapterNumEnd = '';
      let chapterNumStart = chapters.split(' ')[0];
      let bookNumber;

      if (chapters.split(' ').length == 3) {

         chapterNumEnd = chapters.split(' ')[2]

      } else {
         chapterNumEnd = chapters.split(' ')[0]
      }

         bookNumber = `${number}`;


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
      return `${bookNumber}${chapterNumStart}001-${bookNumber}${chapterNumEnd}999`;

   }

   countBooks(array: Array<any>): Number {

      const group = (arr) => {
         const reduced = arr.reduce((acc, curr) => {
            const text = curr.bookNumber;
            acc[text] = acc[text] || 0;
            acc[text]++;
            return acc;
         }, {});
         return Object.getOwnPropertyNames(reduced).map((prop) => ({ text: prop, count: reduced[prop] }));

      };
      var grouped = group(array);
      return grouped.length;
   }

   countChapter(chapters: string): Array<string> {
      let split = chapters.split(' ');

      return split;
   }

   loadFirstPlan() {

      this.fetchReadingPlan().subscribe(plan => {

         this.db.database.ref('/plans').child('1').set({
            index: 1,
            isRead: false,
            name: 'one year',
            numberDaysTotal: 365
         })

         for (var x = 1; x <= 66; x++) {
            const filteredPlan = plan.filter(item => {
               return item.bookNumber == x
            });

            this.filteredPlans.push(filteredPlan)

         }
         this.filteredPlans.forEach(p => {

            this.db.database.ref('/plans').child('1').child('list').child(`${p[0].bookNumber}`).set({
               bookName: p[0].bookName,
               bookNumber: p[0].bookNumber,
               isRead: false,
            })

            for (var i = 1; i <= p.length; i++) {

               this.db.database.ref('/plans').child('1').child('list').child(`${p[0].bookNumber}`).child('chapters').child(`${i}`).set({
                  chapters: p[i - 1].chapters,
                  isRead: false,
                  data: this.formatChapters(p[i - 1].chapters, p[i - 1].bookNumber)
               })

               if (this.countChapter(p[i - 1].chapters).length > 1) {

                  for (var c = Number(this.countChapter(p[i - 1].chapters)[0]); c <= Number(this.countChapter(p[i - 1].chapters)[2]); c++) {
                     this.db.database.ref('/plans').child('1').child('list').child(`${p[0].bookNumber}`).child('chapters').child(`${i}`).child('list').child(`${c}`).set({
                        chapters: `${c}`,
                        isRead: false,
                        data: this.formatChapters(`${c}`, p[i - 1].bookNumber)
                     })
                  }

               }


            }
         })
      })
   }

   loadBibleBooks() {

      this.fetchData().subscribe(d => {


         for (var i = 0; i < 66; i++) {
            this.bibleBooks.push(d.editionData.books[i + 1])


            this.db.database.ref('/bible').child(`${i}`).set({
              book_number: i + 1,
              short_name: d.editionData.books[i + 1].officialAbbreviation,
              standard_name: d.editionData.books[i + 1].standardName,
              total_chapters: d.editionData.books[i + 1].chapterCount
            })


         }
      })

   }

   loadBibleHtml() {
      
      this.db.list('/languages').valueChanges().subscribe(l => {

            let language = l[3];
            let book = 1
            let bible = [];

            this.fetchBible().subscribe(fd => {


                  fd[book - 1]['chapters'].forEach(c => {
                     bible.push(c)
                  });

                  bible.forEach(b => {
     
                     this.fetchLocaleData(language['url'] + b.range).subscribe(f => { 
                        console.log(f)
     
                        for (var x = 19; x < bible.length; x++) {

                           this.db.database.ref('/bible').child(`${book - 1}`).child('chapters').child(`${x}`).child('html').child(`${language['locale']}`).set({
                              html: f.ranges[`${b.range}`].html
                           });
              
                        } 
                     }); 
                  })

               });
            
      });

   }

   loadBibleBookChapters() {

      this.fetchData().subscribe(d => {
         console.log(d.editionData.books['1']);

         for (var i = 0; i < 66; i++) {
            this.bibleBooks.push(d.editionData.books[i + 1])


            for (var x = 0; x < d.editionData.books[i + 1].chapterCount; x++) {

               this.db.database.ref('/bible').child(`${i}`).child('chapters').child(`${x}`).set({
                  chapter_number: x + 1,
                  short_name: d.editionData.books[i + 1].officialAbbreviation,
                  standard_name: d.editionData.books[i + 1].standardName,
                  range: this.formatChapters(`${x + 1}`, i + 1),
               });

            }

         }
      });

   }

   loadRegularPlan() {
      let totaldays = 0;
      let totalChapters = 0;

      this.fetchData().subscribe((d) => {

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
                  data: this.formatChapters(`${x}`, i),
                  isRead: false
               })
            }
         }
      });
   }

   loadPlans(num: number) {
      this.fetchData().subscribe(d => {

         this.fetchPlans().subscribe(plan => {

            let filteredBooks = [];

            let filteredPlan = plan.filter(item => { return item.planNumber == num - 2 })

            for (var b = 1; b <= 66; b++) {
               let filterBook = filteredPlan.filter(book => book.bookNumber == b)
               if (filterBook.length != 0) {
                  filteredBooks.push(filterBook)
               }
            }

            this.db.database.ref('/plans').child(`${num}`).set({
               index: num,
               isRead: false,
               name: this.plans[num],
               numberDaysTotal: filteredPlan.length
            })

            for (var x = 1; x <= this.countBooks(filteredPlan); x++) {


               this.db.database.ref('/plans').child(`${num}`).child('list').child(`${x}`).set({
                  bookNumber: filteredBooks[x - 1][0].bookNumber,
                  isRead: false,
                  bookName: filteredBooks[x - 1][0].bookName
               });

               for (var i = 1; i <= filteredBooks[x - 1].length; i++) {

                  console.log(filteredBooks[x - 1][i - 1].chapters);

                  this.db.database.ref('/plans').child(`${num}`).child('list').child(`${x}`).child('chapters').child(`${i}`).set({
                     chapters: `${filteredBooks[x - 1][i - 1].chapters}`,
                     isRead: false,
                     data: this.formatChapters(`${filteredBooks[x - 1][i - 1].chapters}`, filteredBooks[x - 1][i - 1].bookNumber)
                  });

                  if (this.countChapter(filteredBooks[x - 1][i - 1].chapters).length > 1) {

                     for (var c = Number(this.countChapter(filteredBooks[x - 1][i - 1].chapters)[0]); c <= Number(this.countChapter(filteredBooks[x - 1][i - 1].chapters)[2]); c++) {
                        // console.log(c)
                        this.db.database.ref('/plans').child(`${num}`).child('list').child(`${x}`).child('chapters').child(`${i}`).child('list').child(`${c}`).set({

                           chapters: `${c}`,
                           isRead: false,
                           data: this.formatChapters(`${c}`, filteredBooks[x - 1][i - 1].bookNumber)
                        })
                     }

                  }
               }
            }
         });
      });

   }

   loadPortionObject(bookName: string, data: any): Object {
      let portion = {}
      let name = '';
      let chapters = '';
      let number = 0;

      for (var i = 1; i <= 66; i++) {

         if (bookName.split(' ').length == 4) {

            name = bookName.split(' ')[0];
            chapters = `${bookName.split(' ')[1]} ${bookName.split(' ')[2]} ${bookName.split(' ')[3]}`
            if (data.editionData.books[i].standardName == name) {
               number = i
            }

         } else if (bookName.split(' ').length == 2) {

            name = bookName.split(' ')[0]
            chapters = `${bookName.split(' ')[1]}`

            if (data.editionData.books[i].standardName == name) {
               number = i
            }

         } else if (bookName.split(' ').length == 5) {

            name = `${bookName.split(' ')[0]} ${bookName.split(' ')[1]}`
            chapters = `${bookName.split(' ')[2]} ${bookName.split(' ')[3]} ${bookName.split(' ')[4]}`

            if (data.editionData.books[i].standardName == name) {
               number = i
            }

         } else if (bookName.split(' ').length == 3) {

            name = `${bookName.split(' ')[0]} ${bookName.split(' ')[1]}`
            chapters = `${bookName.split(' ')[3]}`

            if (data.editionData.books[i].standardName == name) {
               number = i
            }

         } else if (bookName.split(' ').length == 6) {

            name = `${bookName.split(' ')[0]} ${bookName.split(' ')[1]} ${bookName.split(' ')[2]}`
            chapters = `${bookName.split(' ')[3]} ${bookName.split(' ')[4]} ${bookName.split(' ')[5]}`

            if (data.editionData.books[i].standardName == name) {
               number = i
            }

         }

         portion = {
            bookName: name,
            bookNumber: number,
            isRead: false,
            chapters: chapters
         }
      }
      return portion
   }

   loadChronoPlan() {
      let bookName: string;
      let bookNumber: number;
      let bookData = [];


      this.fetchChronoPlan().subscribe(data => {

         this.fetchData().subscribe(fd => {

            data.data2.forEach(d => {
               let portion = {};
               let day = []
               let books = [];
               let chapters = [];
               let numb: number;
               d.forEach(b => {

                  day.push(this.loadPortionObject(b, fd))

               })
               bookData.push({ day })

            })
            console.log(bookData)
            this.db.database.ref('/plans').child(`2`).set({
               index: 2,
               isRead: false,
               name: 'chronological',
               numberDaysTotal: bookData.length
            });

            for (var i = 1; i <= bookData.length; i++) {

               bookData[i - 1]['day'].forEach(b => {

                  this.db.database.ref('/plans').child(`2`).child('list').child(`${i}`).child(`list`).child(`${bookData[i - 1]['day'].indexOf(b) + 1}`).set({
                     bookName: b.bookName,
                     bookNumber: b.bookNumber,
                     isRead: false,
                     chapters: b.chapters
                  })

                  if (b.chapters.split(' ').length > 1) {
                     for (var x = Number(this.countChapter(b.chapters)[0]); x <= Number(this.countChapter(b.chapters)[2]); x++) {

                        this.db.database.ref('/plans').child(`2`).child('list').child(`${i}`).child(`list`).child(`${bookData[i - 1]['day'].indexOf(b) + 1}`).child('list').child(`${x}`).set({
                           chapter: x,
                           data: this.formatChapters(`${x}`, b.bookNumber),
                           bookNumber: b.bookNumber,
                           isRead: false,
                        })

                     }
                  }


               })

            }
         })
      })




   }

   getLanguages(url: string, language: string) {

      this.fetchLocaleData(url).subscribe(locale => {
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



   fetchData(): Observable<any> {
      return this.http.get('https://cors-anywhere.herokuapp.com/https://www.jw.org/en/library/bible/nwt/books/json/html/');
   }
 


   fetchBible(): Observable<any> {
     // return this.afs.collection('bible').valueChanges();
      return this.db.list('/bible').valueChanges();
   }


   fetchLocaleData(urlLocale: string): Observable<any> {
     // return this.http.options(`https://www.jw.org${urlLocale}`, httpOptions)
      return this.http.get(`https://www.jw.org${urlLocale}`)
   }

   fetchReadingPlan(): Observable<any> {
      return this.http.get('../../assets/data/ReadingPlans.json')
   }

   fetchChronoPlan(): Observable<any> {
      return this.http.get('../../assets/data/chrono.json')
   }

   fetchPlans(): Observable<any> {
      return this.http.get('../../assets/data/ReadingPlans.json')
   }

   getReadingPlan(): Observable<any> {
      return this.afs.collection('plans').doc('regular').collection('plan').valueChanges();
   }

}
