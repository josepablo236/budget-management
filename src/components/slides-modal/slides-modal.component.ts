import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataLocalService } from 'src/services/data-local.service';
import Swiper from 'swiper';

@Component({
  selector: 'app-slides-modal',
  templateUrl: './slides-modal.component.html',
  styleUrls: ['./slides-modal.component.scss'],
})
export class SlidesModalComponent  implements OnInit {

  slides = [
    { image: 'assets/img/goals.svg', text: 'Comienza tu viaje hacia el éxito financiero y alcanza tus metas con nuestra aplicación de gestión de presupuestos.', title: '¡Bienvenido a la gestión financiera inteligente!'},
    { image: 'assets/img/welcome.svg', text: 'Crea presupuestos personalizados que se adapten a tus necesidades y te ayuden a alcanzar tus metas financieras.', title: 'Establece tus objetivos financieros'},
    { image: 'assets/img/analyst.svg', text: 'Registra tus diferentes ingresos y gastos dentro de tu presupuesto establecido para mantener un seguimiento preciso de tus finanzas.', title: 'Controla tus ingresos y gastos' },
    { image: 'assets/img/chart.svg', text: 'Observa tus movimientos financieros representados visualmente en gráficas intuitivas para tomar decisiones informadas y alcanzar tus objetivos más rápido.', title: 'Visualiza tu progreso' },
  ];

  swiper !: Swiper;

  constructor(private modalCtrl: ModalController, 
              private localService : DataLocalService) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.initSwiper();
  }

  initSwiper() {
    this.swiper = new Swiper('.swiper-container', {
      direction: "horizontal",
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }

  isLastSlide(): boolean {
    return this.swiper?.isEnd;
  }

  async closeModal() {
    this.localService.setSlidesShown();
    await this.modalCtrl.dismiss();
  }

}
