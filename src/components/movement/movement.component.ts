import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Budget, ItemCategory, Movement } from 'src/models/budget-model';
import { DataLocalService } from '../../services/data-local.service';
import { ActionSheetController, AlertController, IonModal, ModalController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../../models/budget-model';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss'],
})
export class MovementComponent  implements OnInit {

  @Input() idBudget : string = '';
  @Output() backEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('modal') modal!: IonModal;
  budget !: Budget;
  description:string = '';
  amount !: number | null;
  type : string = 'expense';
  category : string = '';
  idItemCreated : string = '';
  idCategoryCreated : string = '';
  budgetCategories : Category[] = [];
  totalAlert : boolean = false;

  selectCategories : ItemCategory[] = [];

  constructor(private localService : DataLocalService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl : ModalController,
    private alertCtrl : AlertController) { }

  ngOnInit() {
    this.budget = this.localService.getBudget<Budget>(this.idBudget) || this.budget;
    this.budgetCategories = this.budget.categories;
    this.selectCategories = this.localService.getCategories();
    //If the total < 0 and the alert to advice that expenses can't be added is true
    if(this.budget.total < 0 && !this.totalAlert) {
      //If the budget doesn't have savings
      if(this.budget.savings === undefined || this.budget.savings === 0)
      {
        this.showAlert("Haz sobrepasado tu presupuesto. El total es menor que cero.");
      }
      //If the budget has savings
      else{
        let total = Math.abs(this.budget.total);
        total <= this.budget.savings ? this.showAlert2() : 
        this.showAlert("Haz sobrepasado tu presupuesto. Tus ahorros no alcanzan para saldar tu deuda.");
      }
    }
    this.clean();
  }

  async showAlert(mensaje : string){
    const alert = await this.alertCtrl.create({
      header: 'Alerta',
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async showAlert2(){
    const alert = await this.alertCtrl.create({
      header: 'Alerta',
      message: 'Haz sobrepasado tu presupuesto. ¿Te gustaría utilizar tus ahorros como ingresos para saldar tu deuda?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
              let amountToIncome = 0;
              let total = Math.abs(this.budget.total);
              amountToIncome = total;
              this.localService.updateSavings(this.idBudget, amountToIncome, false);
              const newMovement : Movement = new Movement;
              newMovement.idMovement = uuidv4()
              newMovement.amount = amountToIncome;
              newMovement.category = 'ingresos';
              newMovement.description = 'Ahorro establecido';
              newMovement.type = 'income';
              this.localService.createMovement(this.idBudget, newMovement);
              this.ngOnInit();
          },
        },
      ]
    });

    await alert.present();
  }

  clean(){
    this.description= '';
    this.amount = null;
    this.type = 'expense';
    this.category = '';
    this.idItemCreated = '';
    this.idCategoryCreated = '';
    this.totalAlert =  false;
  }

  async presentCharts() {
    const modal = await this.modalCtrl.create({
      component: ChartComponent,
      componentProps: {
        budget: this.budget
      },
    });
    return await modal.present();
  }

  async deleteMovements(){
    // Delete all the movements
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás seguro que quieres eliminar todos los movimientos y categorias?',
      buttons: [
        {
          text: 'Eliminar movimientos',
          role: 'destructive',
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();
    const { role } = await actionSheet.onWillDismiss();
    if(role === 'destructive'){
      this.localService.deleteAllMovements(this.idBudget);
      this.ngOnInit();
    }
    actionSheet.dismiss();
  }

  canDismiss = async (create : boolean) => {
    if(create){
      return true;
    }
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás seguro que quieres salir?',
      buttons: [
        {
          text: 'Si',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();
    if(role === 'confirm'){
      this.clean();
    }
    return role === 'confirm';
  };

  onBack(){
    this.backEvent.emit(true);
  }

  async onSubmit(){
    const newMovement : Movement = new Movement;
    this.idItemCreated === '' ? newMovement.idMovement = uuidv4() : newMovement.idMovement = this.idItemCreated;
    if(this.amount !== null){
      newMovement.amount = parseFloat(this.amount.toFixed(2));
      newMovement.description = this.description;
      newMovement.type = this.type;
      if(newMovement.type === 'income') {this.category = 'ingresos'};
      newMovement.category = this.category;
      if(this.idItemCreated === '' && this.idCategoryCreated === '')
      {
        if(this.budget.total <= 0 && newMovement.type === 'expense'){
          await this.showAlert("No puedes agregar más gastos al presupuesto debido a que el total es menor o igual a cero.")
          this.totalAlert = true;
        }
        else{this.localService.createMovement(this.idBudget, newMovement)}
      } 
      else{this.localService.editMovement(this.idBudget,this.idItemCreated, this.idCategoryCreated, newMovement);}
      this.modalCtrl.dismiss(true);
      this.ngOnInit();
    }
  }

  editMovement(item: Movement) {
    if(item.description === 'Ahorro establecido'){
      this.showAlert("No puedes editar el ahorro establecido");
    }
    else{
      // Lógica para editar el elemento
      this.idItemCreated = item.idMovement;
      this.idCategoryCreated = item.category;
      this.amount = item.amount;
      this.description = item.description;
      this.type = item.type;
      this.category = item.category;
      console.log("Categoria actual: ", this.category);
      this.modal.present();
    }
  }

  async deleteCategory(item: Category){
    // Delete a category
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás seguro que quieres eliminar esta categoria?',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();
    const { role } = await actionSheet.onWillDismiss();
    if(role === 'destructive'){
      this.localService.deleteMovementsCategory(this.idBudget, item.idCategory);
      this.ngOnInit();
    }
    actionSheet.dismiss();
  }

  async deleteMovement(item: Movement) {
    // Delete a movement
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás seguro que quieres eliminar este movimiento?',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();
    const { role } = await actionSheet.onWillDismiss();
    if(role === 'destructive'){
      if(item.description === 'Ahorro establecido'){
        console.log("Cantidad: ", item.amount);
        this.localService.updateSavings(this.idBudget, item.amount, true);
      }
      this.localService.deleteMovement(this.idBudget, item.idMovement, item.category);
      this.ngOnInit();
    }
    actionSheet.dismiss();
  }

}
