import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Budget } from 'src/models/budget-model';
import { DataLocalService } from 'src/services/data-local.service';

@Component({
  selector: 'app-bugdet-detail',
  templateUrl: './bugdet-detail.component.html',
  styleUrls: ['./bugdet-detail.component.scss'],
})
export class BugdetDetailComponent  implements OnInit {

  @Input() budget!:Budget;
  @Output() editEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleteEvent: EventEmitter<string> = new EventEmitter<string>();

  isActionSheetOpen = false;

  public actionSheetButtons = [
    {
      text: 'Eliminar',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Editar',
      data: {
        action: 'edit',
      },
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(private localService: DataLocalService, private actionSheetCtrl : ActionSheetController) { }

  ngOnInit() {}

  addMovement(){
    this.editEvent.emit(this.budget.idBudget);
  }

  async deleteBudget(){
    // Delete all the movements
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Estás seguro que quieres eliminar el presupuesto?',
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
      this.deleteEvent.emit(this.budget.idBudget);
    }
    actionSheet.dismiss();
  }
}
