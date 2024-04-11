import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import Chart from 'chart.js/auto';
import { Budget } from 'src/models/budget-model';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent  implements OnInit {

  @Input() budget !: Budget;
  @Output() closeEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  grafico: any;

  constructor(private modalCtrl : ModalController) { }

  ngOnInit() {
    this.loadLineChart();
    if(this.budget.expenses > 0){
      this.loadBarChart();
    }
  }

  loadBarChart(){
    const ctx = document.getElementById('chart1') as HTMLCanvasElement;
    const categories = this.budget.categories.filter(val => val.idCategory !== 'ingresos');
    let texts = categories.map(category => category.name);
    const backgroundColors = this.generateRandomColors(categories.length);
    let values = categories.map(val => parseFloat((val.amount / this.budget.expenses * 100).toFixed(2)));
    const myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: texts,
        datasets: [{
          label: 'Porcentaje de gasto %',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
      }
    });
  }

  loadLineChart(){
    const dataMovements : Number[] = [];
    const labels : string[] = [];
    let initialValue = this.budget.initialValue;
    dataMovements.push(initialValue);
    labels.push('Valor inicial');
    this.budget.categories.forEach(item => {
      if(item.type === 'expense'){
        initialValue -= item.amount;
      }
      if(item.type === 'income'){
        initialValue += item.amount;
      }
      dataMovements.push(initialValue);
      let labelValue = this.setLabelValue(item.name);
      labels.push(labelValue);
    });
    const ctx = document.getElementById('chart2') as HTMLCanvasElement;
    this.grafico = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total acumulado',
          data: dataMovements,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {

      }
    });
  }

  getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
  
  // Genera una paleta de colores aleatorios
  generateRandomColors(count: number) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(this.getRandomColor());
    }
    return colors;
  }

  setLabelValue(value : string){
    if (value.length > 10) {
      return value.substring(0, 10) + '...';
    } else {
      return value;
    }
  }

  async onClose(){
    await this.modalCtrl.dismiss();
  }

}
