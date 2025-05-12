import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { map, Observable, startWith } from 'rxjs';
import { ProjectionStore } from '../../stores/projection.store';

@Component({
  standalone: true,
  selector: 'app-projection-chart',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './projection-chart.component.html',
  styleUrls: ['./projection-chart.component.scss'],
})
export class ProjectionChartComponent {
  private store = inject(ProjectionStore);

  @ViewChild('chart') chart!: ChartComponent;

  series$: Observable<ApexAxisChartSeries> = this.store.chartSeries$.pipe(
    map((s) => (s ?? []) as ApexAxisChartSeries),
    startWith([] as ApexAxisChartSeries)
  );

  private getDynamicLabels(): string[] {
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const today = new Date();
    const currentDayOfWeek = today.getDay();

    let startIndexInWeekdays: number;

    if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
      startIndexInWeekdays = 0;
    } else {
      startIndexInWeekdays = currentDayOfWeek - 1;
    }

    const dynamicLabels: string[] = ['Hoje'];
    for (let i = 1; i < 5; i++) {
      const nextDayIndex = (startIndexInWeekdays + i) % 5;
      dynamicLabels.push(dayNames[nextDayIndex]);
    }
    return dynamicLabels;
  }

  labels: string[] = this.getDynamicLabels();

  chartOptions: ApexChart = { type: 'bar', stacked: true, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: this.labels };
  yaxis: ApexYAxis = {
    title: {
      text: 'Quantidade de eventos',
      style: {
        fontWeight: 'bold',
        fontSize: '14px',
      }
    }
  }; legend: ApexLegend = { position: 'bottom' };
  tooltip: ApexTooltip = { y: { formatter: (v) => `${v} events` } };
}
