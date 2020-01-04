import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
        }
      })
    })
  }

  loadBibleBooks() {

    this.fetchData().subscribe(d => {
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

      }
    })

  }

  loadBibleBookChapters() {

    this.fetchData().subscribe(d => {
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

        for (var x = 1; x <= this.countBooks(filteredPlan); x++) {

          this.db.database.ref('/plans').child(`${num}`).child('list').child(`${x}`).set({
            bookNumber: x,
            isRead: false,
            bookName: filteredBooks[x - 1][0].bookName
          });

          for (var i = 1; i <= filteredBooks[x - 1].length; i++) {
            this.db.database.ref('/plans').child(`${num}`).child('list').child(`${x}`).child('chapters').child(`${i}`).set({
              chapters: `${filteredBooks[x - 1][i - 1].chapters}`,
              isRead: false,
              data: this.formatChapters(`${filteredBooks[x - 1][0].chapters}`, filteredBooks[x - 1][i - 1].bookNumber)
            });
          }
        }
      })
    });

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
    return this.http.get('https://cors-anywhere.herokuapp.com/https://www.jw.org/en/library/bible/nwt/books/json/');
  }

  fetchBible(): Observable<any> {
    return this.afs.collection('bible').valueChanges();
  }

  fetchLocaleData(urlLocale: string): Observable<any> {
    return this.http.get(`https://cors-anywhere.herokuapp.com/${urlLocale}`)
  }

  fetchReadingPlan(): Observable<any> {
    return this.http.get('../../assets/data/ReadingPlans.json')
  }

  fetchPlans(): Observable<any> {
    return this.http.get('../../assets/data/ReadingPlans.json')
  }

  getReadingPlan(): Observable<any> {
    return this.afs.collection('plans').doc('regular').collection('plan').valueChanges();
  }

}
