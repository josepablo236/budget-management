import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Budget } from 'src/models/budget-model';
import { v4 as uuidv4 } from 'uuid';
import { DataLocalService } from 'src/services/data-local.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})

export class BudgetComponent  implements OnInit {

  @Output() createEvent: EventEmitter<void> = new EventEmitter<void>();

  initialBudget!:number;
  nameBudget : string = '';
  selectedDate!:string;
  minDate: string = '';
  maxDate: string = '';
  savings !: number;
  addSavings : string = 'no';

  constructor(private localService: DataLocalService) { 
    
  }

  ngOnInit() {
    //I need to get the current month and year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months in Javascrypt are from 0 to 11
    this.selectedDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`; // Format Date YYYY-MM
    this.minDate = `${currentYear - 1}-01-01`; // One year before current year
    this.maxDate = `${currentYear + 1}-12-31`; // One year after current year
  }

  onDateChanged(event: CustomEvent) {
    this.selectedDate = event.detail.value;
  }

  onBack(){
    this.createEvent.emit();
  }

  onSubmit() {
    //I need to save the date in Spanish format 'Mes de año'
    const [year, month] = this.selectedDate.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    let formattedDate = date.toLocaleDateString('es-ES', options); 
    this.selectedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    const newBudget = new Budget();
    newBudget.idBudget = uuidv4();
    newBudget.name = this.nameBudget;
    newBudget.initialValue = parseFloat(this.initialBudget.toFixed(2));
    newBudget.date = this.selectedDate;
    if(this.savings !== undefined){ newBudget.savings = parseFloat((newBudget.initialValue * (this.savings / 100)).toFixed(2)); newBudget.savingPercent = this.savings;}
    console.log("Nuevo presupuesto: ", newBudget);
    this.localService.setBudget(newBudget.idBudget, newBudget);
    this.createEvent.emit();
  }

}
