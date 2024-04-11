import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { BudgetComponent } from './budget/budget.component';
import { FormsModule } from '@angular/forms';
import { BugdetDetailComponent } from './bugdet-detail/bugdet-detail.component';
import { MovementComponent } from './movement/movement.component';
import { ChartComponent } from './chart/chart.component';
import { SlidesModalComponent } from './slides-modal/slides-modal.component';



@NgModule({
  declarations: [
    BudgetComponent,
    HeaderComponent,
    BugdetDetailComponent,
    MovementComponent,
    ChartComponent,
    SlidesModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports:[
    BudgetComponent,
    HeaderComponent,
    BugdetDetailComponent,
    MovementComponent,
    ChartComponent,
    SlidesModalComponent
  ]
})
export class ComponentsModule { }
