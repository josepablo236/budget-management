import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Budget } from 'src/models/budget-model';
import { SlidesModalComponent } from 'src/components/slides-modal/slides-modal.component';
import { DataLocalService } from 'src/services/data-local.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  budgetList : Budget[] = [];
  createNewBudget : boolean = false;
  createMovements : boolean = false;
  budgetToEdit !: string;

  constructor(private localService: DataLocalService,
              private modalCtrl : ModalController,
              private actionSheetCtrl : ActionSheetController) {}

  ngOnInit() {
    const slidesShown = this.localService.getSlidesShown();
      if (!slidesShown) {
        //It's the first time so show the slides
        this.presentModal();
      }
    this.budgetList = this.localService.getAllBudgets();
    this.limpiar();
  }

  async presentModal() {
    const modal = await this.modalCtrl.create({
      component: SlidesModalComponent,
    });
    return await modal.present();
  }

  limpiar(){
    this.createNewBudget = false;
    this.createMovements = false;
  }

  createBudget(){
    this.createNewBudget = true;
  }

  onCreateClicked(){
    this.createNewBudget = false;
    this.ngOnInit();
  }

  onDeleteClicked(ev:string){
    this.localService.removeBudget(ev);
    this.ngOnInit();
  }

  onEditClicked(ev:string){
    this.createMovements = true;
    this.budgetToEdit = ev;
  }

  onBackToHome(ev:boolean){
    if(ev){
      this.ngOnInit();
    }
  }

  async onDeleteAll(){
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Deseas eliminar todos los presupuestos creados?',
      buttons: [
        {
          text: 'Eliminar todo',
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
      this.localService.clear();
      this.ngOnInit();
    }
    actionSheet.dismiss();
    
  }

}
