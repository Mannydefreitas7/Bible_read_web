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
     // this.bibleService.loadFirstPlan(); 
   //  this.bibleService.loadRegularPlan();
   //   for (var a = 3; a <= 12; a++) {
   //      this.bibleService.loadPlans(a);  
   //   }

   //this.bibleService.loadChronoPlan();
   //this.bibleService.loadBibleBooks();
   }

}

