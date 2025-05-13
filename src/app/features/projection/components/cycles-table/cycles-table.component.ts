import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { combineLatest, map, Observable } from 'rxjs';

import { ProjectionStore, distributeEntities } from '../../stores/projection.store';
import { Cycle } from '../../../../../shared/models/api.models';
import { ProjectionChartComponent } from '../projection-chart/projection-chart.component';
import { buildChartSeries, nextBusinessDays } from '../../stores/projection.store';

type CycleInTable = Cycle & {
  eventsToday: number;
  isSelected: boolean;
  allocatedEntities: number;
};

@Component({
  standalone: true,
  selector: 'app-cycles-table',
  templateUrl: './cycles-table.component.html',
  styleUrls: ['./cycles-table.component.scss'],
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
  ],
})
export class CyclesTableComponent {

  private store = inject(ProjectionStore);
  private entitiesToStart$ = this.store.entitiesToStart$;

  @ViewChild(ProjectionChartComponent) chartComponent!: ProjectionChartComponent;

  displayedAvailableColumns: string[] = ['select', 'priority', 'name', 'count', 'eventsToday'];
  displayedUnavailableColumns: string[] = ['selectDisabled', 'priority', 'name'];

  private baseCyclesWithEventsToday$: Observable<(Cycle & { eventsToday: number })[]> = this.store.data$.pipe(
    map((d) => d?.cycles ?? []),
    map((arr) =>
      arr.map((c) => {
        const todayActual = new Date();
        let todayWeekday = todayActual.getDay();

        if (todayWeekday === 0 || todayWeekday === 6) {
          todayWeekday = 1;
        }

        const todayStruct = c.structure.find((s) => s.day === todayWeekday);
        const eventsToday =
          (todayStruct?.meetings ?? 0) +
          (todayStruct?.emails ?? 0) +
          (todayStruct?.calls ?? 0) +
          (todayStruct?.follows ?? 0);
        return { ...c, eventsToday };
      })
    )
  );

  private selectedCyclesFromStore$ = this.store.selectedCycles$;

  vm$ = combineLatest([
    this.baseCyclesWithEventsToday$,
    this.selectedCyclesFromStore$,
    this.entitiesToStart$
  ]).pipe(
    map(([allCyclesWithEvents, selectedCyclesArray, entitiesToStartValue]) => {
      const distributedEntitiesMap = distributeEntities(selectedCyclesArray, entitiesToStartValue);

      const cyclesWithFullState: CycleInTable[] = allCyclesWithEvents.map(c => ({
        ...c,
        isSelected: selectedCyclesArray.some(sc => sc.name === c.name),
        allocatedEntities: distributedEntitiesMap.get(c.name) ?? 0
      }));

      const sortedCycles = [...cyclesWithFullState].sort(
        (a, b) =>
          ({ HIGH: 0, MEDIUM: 1, LOW: 2 } as const)[a.priority] -
          ({ HIGH: 0, MEDIUM: 1, LOW: 2 } as const)[b.priority]
      );

      return {
        available: sortedCycles.filter((c) => c.availableEntities > 0),
        unavailable: sortedCycles.filter((c) => c.availableEntities === 0),
      };
    })
  );

  toggle(cycle: Cycle) {
    this.store.toggleCycle(cycle);
    const data = this.store.getData()?.eventsProjection ?? [];
    const selectedCycles = this.store.getSelectedCycles();
    const entities = this.store.getEntitiesToStart();

    const series = buildChartSeries(data, selectedCycles, entities, nextBusinessDays(5));

    if (this.chartComponent && this.chartComponent.chart) {
      this.chartComponent.chart.updateSeries(series, true);
    }
  }

  priorityColor(p: Cycle['priority']) {
    return (
      { HIGH: '#E21B1B', MEDIUM: '#F5A623', LOW: '#0CA678' } as const
    )[p];
  }
}
