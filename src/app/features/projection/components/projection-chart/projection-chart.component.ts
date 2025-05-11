import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
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

  /** stream já inicializado com [] */
  series$: Observable<ApexAxisChartSeries> = this.store.chartSeries$.pipe(
    map((s) => (s ?? []) as ApexAxisChartSeries),
    startWith([] as ApexAxisChartSeries)
  );

  labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

  chart:  ApexChart  = { type: 'bar', stacked: true, toolbar: { show: false } };
  xaxis:  ApexXAxis  = { categories: this.labels };
  yaxis:  ApexYAxis  = { title: { text: 'Events' } };
  legend: ApexLegend = { position: 'bottom' };
  tooltip:ApexTooltip= { y: { formatter: (v) => `${v} events` } };
}
