import { Component } from '@angular/core';
import { BibleService } from './bible.service';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss']
})
export class AppComponent {
   

   constructor(private bibleService: BibleService) { }

   ngOnInit() {
     // this.bibleService.getLanguagesCount().subscribe(data => console.log(data))
      
     // this.bibleService.loadBibleLanguage("cs", 30)

     // this.bibleService.loadLocales()
  //  this.bibleService.loadFirstPlan(); 
//this.bibleService.loadRegularPlan();
   //   for (var a = 3; a <= 12; a++) { 
   //      this.bibleService.loadPlans(a);  
   //   }

      //   for (var a = 3; a <= 12; a++) {
      //     this.bibleService.loadSelectedPlans(a);  
      //  } 
   
 // this.bibleService.loadLanguages()
  //this.bibleService.loadLanguage()
 //  this.bibleService.loadChronoPlan();
   //this.bibleService.loadBibleBooks();
  // this.bibleService.loadBibleHtml();
   // this.bibleService.loadBibleBookChapters();
   // this.bibleService.fetchData().subscribe(data => {
   // //    console.log(data)
   // // })
   }
 
} 

