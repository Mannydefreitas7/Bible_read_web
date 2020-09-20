import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators';
import { BibleData, BibleLanguage, Bible, BibleBook } from './classes/bible'
import { AngularFireDatabase } from '@angular/fire/database';
import { v4 as uuidv4 } from 'uuid';
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
   plans = [];
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
            const text = Number(curr.bookNumber);
            acc[text] = acc[text] || 0;
            acc[text]++;
            return acc;
         }, {});
         return Object.getOwnPropertyNames(reduced).map((prop) => ({ text: prop, count: reduced[prop] }));

      };
      var grouped = group(array);
      return grouped.length;
   }

   countBookArray(array: Array<any>): any[] {

      const group = (arr) => {
         const reduced = arr.reduce((acc, curr) => {
            const text = Number(curr.bookNumber);
            acc[text] = acc[text] || 0;
            acc[text]++;
            return acc;
         }, {});
         return Object.getOwnPropertyNames(reduced).map((prop) => ({ text: prop, count: reduced[prop] }));

      };
      var grouped = group(array);
      return grouped;
   }

   countChapter(chapters: string): Array<string> {
      let split = chapters.split(' ');

      return split;
   }

   loadFirstPlan() {
      let books = []


      this.fetchReadingPlan().subscribe(plan => {

       //  console.log(plan)
          for (var x = 1; x <= 66; x++) {
            let filteredPlan = plan.filter(item => {
                return item.bookNumber == x
             });
             this.filteredPlans.push(filteredPlan)
            }
            

            this.filteredPlans.forEach(f => {
               books.push(f[0].bookNumber)
               this.db.database.ref('/plans').child('1').set({
                  index: 1,
                  isRead: false,
                  name: 'one year',
                  planNumber: 1,
                  planImageSQR: `plan_1_sqr`,
                  planImagePNR: `plan_1_pnr`,
                  numberDaysTotal: 365,
                  books: books
               })
            })

         // }
         console.log(this.filteredPlans)
         plan.forEach((p, i) => {
            let chapters = []
     
               let isMultiple: Boolean = p.chapters.split("-").length > 1
               let firstChapter = Number(p.chapters.split("-")[0].trim())

               if (isMultiple) {
                 let lastChapter = Number(p.chapters.split("-")[1].trim())
                  for(let y = firstChapter; y <= lastChapter; y++) {
                     chapters.push(y)
                  }
               } else {
                  chapters = [firstChapter]
               }

               this.db.database.ref('/plans').child('1').child('days').child(`${i}`).set({
                  chapters: p.chapters,
                  isRead: false,
                  data: this.formatChapters(p.chapters, p.bookNumber),
                  bookName: p.bookName,
                  planNumber: 1,
                  bookNumber: p.bookNumber,
                  chapterArray: chapters
               })
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

   loadLanguage() {
     
         this.fetchLanguages().subscribe(l => {
            l.forEach((element, index) => {
               this.fetchLanguage(`${element['locale']}`).subscribe(lang => {
                  
                  lang.forEach((item, index) => {
                     this.db.database.ref('/languages').child(`${element['locale']}`).child('books').child(`${item['bookID'] - 1}`).set({
                        bookID: item['bookID'],
                        chapterCount: item['chapterCount'],
                        hasAudio: item['hasAudio'] == 1 ? true : false,
                        longName: item['longName'],
                        shortName: item['shortName']
                     })
                  });
               })
            });
   })
   }

   loadLocales() {
     
      this.fetchLocales().subscribe(l => {
         l.forEach(locale => {
            this.db.database.ref('/locales').child(`${locale['locale']}`).set({
               api: locale['api'],
               audioCode: locale['audioCode'],
               bibleTranslation: locale['bibleTranslation'],
               contentApi: locale['contentApi'],
               index: locale['index'],
               isRTL: locale['isRTL'] == 1 ? true : false,
               locale: locale['locale'],
               name:  locale['name'],
               vernacularName: locale['vernacularName'],
            })
            locale['bibles'].forEach((bible, index) => {
               this.db.database.ref('/locales').child(`${locale['locale']}`).child('bibles').child(`${index}`).set({
                  bibleTranslation: bible['bibleTranslation'],
                  contentApi:  bible['contentApi'],
                  id: bible['id'],
                  index: bible['index'],
                  symbol: bible['symbol']
               })
            });
            locale['books'].forEach((books, index) => {
               this.db.database.ref('/locales').child(`${locale['locale']}`).child('books').child(`${index}`).set({
                  bookID: books['bookID'],
                  chapterCount: books['chapterCount'],
                  hasAudio: books['hasAudio'],
                  longName: books['longName'],
                  shortName: books['shortName']
               })
            });
         });
   })
}

   loadLanguages() {
      this.fetchLanguages().subscribe(l => {
       
         l.forEach((element, index) => {
            console.log(element['locale'])
            this.db.database.ref('/languages').child(`${index}`).set({
               api: element['api'],
               audioCode: element['audioCode'],
               bibleTranslation: element['bibleTranslation'],
               contentApi: element['contentApi'],
               index: element['index'],
               isRTL: element['isRTL'] == 1 ? true : false,
               locale: element['locale'],
               name:  element['name'],
               vernacularName: element['vernacularName'],
            })
         });
      //   this.db.database.ref('/languages')
      })
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
      let plans = []
      let books = []

      this.fetchData().subscribe((d) => {

         for (var i = 1; i <= 66; i++) {
            

            this.bibleBooks.push(d.editionData.books[`${i}`])
            totalChapters = Number(d.editionData.books[`${i}`].chapterCount)
            totaldays += totalChapters;


            for (var x = 1; x <= totalChapters; x++) {
               
               plans.push({
                  chapters: String(x),
                  bookName: d.editionData.books[`${i}`].standardName,
                  bookNumber: i,
                  isRead: false,
                  data: this.formatChapters(`${x}`, i)
               })
            }
         }

         for (var x = 1; x <= 66; x++) {
            let filteredPlan = plans.filter(item => {
                return item.bookNumber == x
             });
             this.filteredPlans.push(filteredPlan)
            }

            this.filteredPlans.forEach(f => {
            books.push(f[0].bookNumber)
            this.db.database.ref('/plans').child(`0`).set({
               index: 0,
               isRead: false,
               name: 'regular',
               planNumber: 0,
               numberDaysTotal: totaldays,
               planImageSQR: `plan_0_sqr`,
               planImagePNR: `plan_0_pnr`,
               books: books
            });
            })

         plans.forEach((p, i) => {
            let chapters = [Number(p.chapters)]

            this.db.database.ref('/plans').child(`0`).child('days').child(`${i}`).set({
               chapters: p.chapters,
               bookName: p.bookName,
               bookNumber: p.bookNumber,
               planNumber: 0,
               isRead: false,
               data: p.data,
               chapterArray: chapters
               })
            })
      });
   }



   loadSelectedPlans(num: number) {
      let books = []
     // this.fetchData().subscribe(d => {
         let filteredPlan = []
         this.fetchPlans().subscribe(plan => {

            filteredPlan = plan.filter(item => { return item.planNumber == num - 2 })
            

            this.countBookArray(filteredPlan).forEach(f => {
            books.push(Number(f.text))
            this.db.database.ref('/plans').child(`${num}`).set({
               index: num,
               isRead: false,
               name: this.plans[num],
               numberDaysTotal: filteredPlan.length,
               planImageSQR: `plan_${num}_sqr`,
               planImagePNR: `plan_${num}_pnr`,
               books: books
            })
            })
          //  filteredPlan.sort((a, b) => b.bookNumber < a.bookNumber)
            filteredPlan.forEach((p, x) => {
               let chapters = []
     
               let isMultiple: Boolean = p.chapters.split("-").length > 1
               let firstChapter = Number(p.chapters.split("-")[0].trim())

               if (isMultiple) {
                 let lastChapter = Number(p.chapters.split("-")[1].trim())
                  for(let y = firstChapter; y <= lastChapter; y++) {
                     chapters.push(y)
                  }
               } else {
                  chapters = [firstChapter]
               }

               this.db.database.ref('/plans').child(`${num}`).child('days').child(`${x}`).set({
                  bookNumber: p.bookNumber,
                  isRead: false,
                  bookName: p.bookName,
                  chapters: p.chapters,
                  planNumber: num,
                  data: this.formatChapters(`${p.chapters}`, p.bookNumber),
                  chapterArray: chapters
               });
            });
         });
     // });

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

   loadBibleLanguage(locale: string, index: number) {

      this.fetchBibleLanguage().subscribe(data => {
         let language: BibleLanguage = data[locale]
         // add to languages...
      var name: String
      if (language.lang.name.split(" ").length > 1) {
         name = `locale${language.lang.name.split(" ")[0].toLowerCase()}${language.lang.name.split(" ")[1].toLowerCase()}`
      } else {
         name = `locale${language.lang.name.toLowerCase()}`
      }
      //  this.getLanguagesCount().subscribe(currentIndex => {
         this.db.database.ref('/languages').child(`${index}`).set({
            api: 'https://www.jw.org/en/library/bible/json/',
            audioCode: language.lang.langcode,
            bibleTranslation: "",
            contentApi: "",
            index: index,
            isRTL: false,
            locale: language.lang.symbol,
            name: name,
            vernacularName: language.lang.name,
         })
         language.editions.forEach((bible, bibleIndex) => {
            this.db.database.ref('/languages').child(`${index}`).child('bibles').child(`${bibleIndex}`).set({
               bibleTranslation: bible.title,
               contentApi: bible.contentAPI != null ? bible.contentAPI : "",
               id: uuidv4(),
               index: bibleIndex,
               symbol: bible.symbol
            })
         })

         this.fetchBibleBooks(language.editions[0].contentAPI).subscribe(content => {
            for (let bookindex = 1; bookindex <= 66; bookindex++) {
              let bibleBook: BibleBook = content.editionData.books[bookindex]
                
                  this.db.database.ref('/languages').child(`${index}`).child('books').child(`${bookindex - 1}`).set({
                  bookID: Number(bookindex),
                  chapterCount: bibleBook.chapterCount,
                  hasAudio: bibleBook.hasAudio,
                  longName: bibleBook.standardName,
                  shortName: bibleBook.officialAbbreviation 
               })
            };
         }) 
               
            
        // })
      })
}

   loadChronoPlan() {
      let bookName: string;
      let bookNumber: number;
      let bookData = [];
      let books = []

      this.fetchChronoPlan().subscribe(data => {

         for (var x = 1; x <= 66; x++) {
            books.push(x)
         }

            this.db.database.ref('/plans').child(`2`).set({
               index: 2,
               isRead: false,
               name: 'chronological',
               numberDaysTotal: data.length,
               planImagePNR: "plan_2_pnr",
               planImageSQR: "plan_2_sqr",
               books: books
            });



            data.forEach((d, i) => {

               let chapters = []
             
               let isMultiple: Boolean = d['Chapters'].split("-").length > 1
               let firstChapter = Number(d['Chapters'].split("-")[0].trim())

               if (isMultiple) {
                 let lastChapter = Number(d['Chapters'].split("-")[1].trim())
                  for(let y = firstChapter; y <= lastChapter; y++) {
                     chapters.push(y)
                  }
               } else {
                  chapters = [firstChapter]
               }

               this.db.database.ref('/plans').child(`2`).child('days').child(`${i}`).set({
                  bookName: d['BookName'],
                  bookNumber: d['BookNumber'],
                  isRead: false,
                  data: d['Chapters_data'],
                  chapters: d['Chapters'],
                  planNumber: 2,
                  chapterArray: chapters
               })
            });
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

   fetchBibleBooks(url: string): Observable<Bible> {
      return this.http.get(`https://cors-anywhere.herokuapp.com/${url}`)
   }


   fetchLocaleData(urlLocale: string): Observable<any> {
     // return this.http.options(`https://www.jw.org${urlLocale}`, httpOptions)
      return this.http.get(`https://www.jw.org${urlLocale}`)
   }

   fetchBibleLanguage(): Observable<any> {
      var languages: [BibleLanguage]
      return this.http.get('https://cors-anywhere.herokuapp.com/https://www.jw.org/en/library/bible/json/').pipe(
         map(data => {
            return data['langs']
         })
      )
   }

   fetchReadingPlan(): Observable<any> {
      return this.http.get('../../assets/data/ReadingPlans.json')
   }

   fetchChronoPlan(): Observable<any> {
      return this.http.get('../../assets/json/plan_2.json')
   }

   fetchPlans(): Observable<any> {
      return this.http.get('../../assets/data/ReadingPlans.json')
   }

   fetchLanguage(locale: string): Observable<any> {
      return this.http.get(`../../assets/json/${locale}.json`)
   }
   fetchLanguages(): Observable<any> {
      return this.http.get(`../../assets/json/languages.json`)
   }

   getLanguagesCount(): Observable<number> {
      return this.db.list('languages').valueChanges().pipe(
         map(data => data.length - 1)
      )
   }

   fetchLocales(): Observable<any> {
      return this.http.get(`../../assets/json/brlanguages.json`)
   }

   getReadingPlan(): Observable<any> {
      return this.afs.collection('plans').doc('regular').collection('plan').valueChanges();
   }

}
