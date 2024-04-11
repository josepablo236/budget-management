import { Injectable } from '@angular/core';
import { Budget, Category, ItemCategory, Movement } from 'src/models/budget-model';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  categories : ItemCategory[] = [
    { value: 'alimentacion', text: 'Alimentación'},
    { value: 'hogar', text: 'Hogar'},
    { value: 'servicios', text: 'Servicios'},
    { value: 'transporte', text: 'Transporte'},
    { value: 'salud', text: 'Salud'},
    { value: 'educacion', text: 'Educación'},
    { value: 'impuestos', text: 'Impuestos'},
    { value: 'seguros', text: 'Seguros'},
    { value: 'entretenimiento', text: 'Entretenimiento'},
    { value: 'ropa', text: 'Ropa y accesorios'},
    { value: 'deudas', text: 'Deudas y finanzas'},
    { value: 'ahorros', text: 'Ahorros e inversiones'},
    { value: 'otros', text: 'Otros'},
  ];

  constructor() {
  }

  //Get slidesShown
  getSlidesShown(){
    return localStorage.getItem('slidesShown');
  }

  //Set slidesShown
  setSlidesShown(){
    localStorage.setItem('slidesShown', JSON.stringify(true));
  }

  //getCategories
  getCategories() : ItemCategory[] {
    return this.categories;
  }

  // Set a budget into localstorage
  setBudget(key:string, budget : Budget): void {
    console.log("Valor que recibo: ", budget);
    budget.incomes = 0;
    budget.expenses = 0;
    budget.total = parseFloat((budget.initialValue + budget.incomes - budget.expenses).toFixed(2));
    if(budget.savings !== undefined){budget.total -= budget.savings; budget.initialValue -= budget.savings};
    localStorage.setItem(key, JSON.stringify(budget));
  }

  // Get a budget from localstorage
  getBudget<Budget>(key: string): Budget | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  //Update the savings of budget
  updateSavings(key : string, amount : number, add : boolean){
    const item = localStorage.getItem(key);
    if(item !== null){
      const budget : Budget = JSON.parse(item);
      if(budget.savings !== undefined){
        add ? budget.savings += amount : budget.savings -= amount;
        localStorage.setItem(key, JSON.stringify(budget));
      }
    }
  }

  //Create a new movement
  createMovement(keyBudget: string, movement : Movement){
    const item = localStorage.getItem(keyBudget);
    if(item !== null){
      const budget : Budget = JSON.parse(item);
      //Category
      let existingCategory = budget.categories.find(c => c.idCategory === movement.category);
      //Category does not exist
      if(!existingCategory){ 
        existingCategory = new Category();
        existingCategory.idCategory = movement.category;
        existingCategory.type = movement.category === 'ingresos' ? 'income' : 'expense';
        console.log("Tipo de la categoria", existingCategory.type);
        if(existingCategory.type === 'income') {existingCategory.name = 'Ingresos'}
        else {let cat = this.categories.find(c => c.value === movement.category);
        cat ? existingCategory.name = cat.text : null;}
        budget.categories.push(existingCategory);
      }
      existingCategory.movements.push(movement);
      //Increase the amount depends of type
      existingCategory.amount += parseFloat(movement.amount.toFixed(2));
      if (movement.type === 'expense') {
        budget.expenses += parseFloat(movement.amount.toFixed(2));
      } else if (movement.type === 'income') {
        budget.incomes += parseFloat(movement.amount.toFixed(2));
      }
      budget.total = parseFloat((budget.initialValue + budget.incomes - budget.expenses).toFixed(2));
      localStorage.setItem(keyBudget, JSON.stringify(budget));
    }
  }

  // Get all budgets from localstorage
  getAllBudgets(): Budget[] {
    const values: Budget[] = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if(key !== 'slidesShown'){
        const value = localStorage.getItem(key);
        if (value !== null) {
          values.push(JSON.parse(value));
        }
      }
    }
    return values;
  }

  //Edit a movement
  editMovement(keyBudget: string, movementId: string, categoryId: string, updatedMovement: Movement): void {
    const item = localStorage.getItem(keyBudget);
    console.log(updatedMovement.category, categoryId);
    if (item !== null) {
      const budget: Budget = JSON.parse(item);
      //Find the category by its id
      let existingCategory = budget.categories.find(c => c.idCategory === categoryId);
      if(existingCategory){
        //If the existing category does not equal to updated movement category
        if(existingCategory.idCategory !== updatedMovement.category){
          console.log("Entra aqui porque es categoria diferente: ", existingCategory.idCategory, updatedMovement.category);
          this.deleteMovement(keyBudget, updatedMovement.idMovement, categoryId);
          this.createMovement(keyBudget, updatedMovement);
        }
        else{
          // Find the existing movement by its id
          const existingMovementIndex = existingCategory.movements.findIndex(movement => movement.idMovement === movementId);
          if (existingMovementIndex !== -1) {
            const existingMovement = existingCategory.movements[existingMovementIndex];
            // Update the amounts according to the original movement
            if (existingMovement.type === 'expense') {
              budget.expenses -= parseFloat(existingMovement.amount.toFixed(2));
            } else if (existingMovement.type === 'income') {
              budget.incomes -= parseFloat(existingMovement.amount.toFixed(2));
            }
            //Update the category amount 
            existingCategory.amount -= parseFloat(existingMovement.amount.toFixed(2));
            // Update the movement with the new data
            existingCategory.movements[existingMovementIndex] = updatedMovement;
            // Update the budget amounts according to the updated movement
            if (updatedMovement.type === 'expense') {
              budget.expenses += parseFloat(updatedMovement.amount.toFixed(2));
            } else if (updatedMovement.type === 'income') {
              budget.incomes += parseFloat(updatedMovement.amount.toFixed(2));
            }
            //Update the category amount 
            existingCategory.amount += parseFloat(updatedMovement.amount.toFixed(2));
            
            // Update budget total
            budget.total = parseFloat((budget.initialValue + budget.incomes - budget.expenses).toFixed(2));
  
            // Save the updated budget to localstorage
            localStorage.setItem(keyBudget, JSON.stringify(budget));
          }
        }
      }
    }
  }

  deleteMovement(keyBudget: string, movementId: string, categoryID: string): void {
    const item = localStorage.getItem(keyBudget);
    if (item !== null) {
      const budget: Budget = JSON.parse(item);
      //Find the category
      let existingCategory = budget.categories.find(c => c.idCategory === categoryID);
      if(existingCategory){
        // Find the movement index to remove by its ID
        const indexToRemove = existingCategory.movements.findIndex(movement => movement.idMovement === movementId);
        if (indexToRemove !== -1) {
          const removedMovement = existingCategory.movements[indexToRemove];
          // Update budget amounts according to the type of movement
          if (removedMovement.type === 'expense') {
            budget.expenses -= parseFloat(removedMovement.amount.toFixed(2));
          } else if (removedMovement.type === 'income') {
            budget.incomes -= parseFloat(removedMovement.amount.toFixed(2));
          }
          //Update category amount 
          existingCategory.amount -= parseFloat(removedMovement.amount.toFixed(2));

          // Delete the movement from movements array
          existingCategory.movements.splice(indexToRemove, 1);
          if(existingCategory.movements.length === 0){
            const indexCategory = budget.categories.findIndex(c => c.idCategory === categoryID);
            budget.categories.splice(indexCategory, 1);
          }
          
          // Update the budget total
          budget.total = parseFloat((budget.initialValue + budget.incomes - budget.expenses).toFixed(2));
          
          // Save the budget to localstorage
          localStorage.setItem(keyBudget, JSON.stringify(budget));
        }
      }
    }
  }

  //Delete all movements from one category
  deleteMovementsCategory(keyBudget: string, categoryID: string){
    const item = localStorage.getItem(keyBudget);
    if (item !== null) {
      const budget: Budget = JSON.parse(item);
      //Find category
      const indexToRemove = budget.categories.findIndex(c => c.idCategory === categoryID);
      if(indexToRemove !== -1){
        const removedMovement = budget.categories[indexToRemove];
        budget.expenses -= removedMovement.type === 'expense' ? removedMovement.amount : 0;
        budget.incomes -= removedMovement.type === 'income' ? removedMovement.amount : 0;
        budget.total = parseFloat((budget.initialValue + budget.incomes - budget.expenses).toFixed(2));
      }
    }
  }

  //Delete all movements
  deleteAllMovements(keyBudget: string): void {
    const item = localStorage.getItem(keyBudget);
    if (item !== null) {
      const budget: Budget = JSON.parse(item);
      
      // Restart the movements array
      budget.categories = [];
      budget.expenses = 0;
      budget.incomes = 0;
      budget.total = budget.initialValue;

      if(budget.savings !== undefined && budget.savingPercent){
        //Initial value * saving percent / 100% - saving percent
        let first = budget.initialValue * (budget.savingPercent / 100);
        let second = (100 - budget.savingPercent)/100;
        budget.savings = parseFloat((first/second).toFixed(0));
      }
      
      // Save the updated budget to localstorage
      localStorage.setItem(keyBudget, JSON.stringify(budget));
    }
  }

  // Delete a budget to local storage
  removeBudget(key: string): void {
    localStorage.removeItem(key);
  }

  // Clean local storage
  clear(): void {
    localStorage.clear();
    localStorage.setItem('slidesShown', JSON.stringify(true));
  }

}
