import { Component, inject } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatTableModule }    from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { combineLatest, map } from 'rxjs';

import { ProjectionStore } from '../../stores/projection.store';
import { Cycle } from '../../../../../shared/models/api.models';

@Component({
  standalone: true,
  selector: 'app-cycles-table',
  imports: [CommonModule, MatTableModule, MatCheckboxModule],
  templateUrl: './cycles-table.component.html',
  styleUrls: ['./cycles-table.component.scss'],
})
export class CyclesTableComponent {

  displayedColumns = ['select', 'name', 'priority', 'available'];

  private store = inject(ProjectionStore);

  cycles$ = this.store.data$.pipe(
    map((d) => d?.cycles ?? []),
    map((arr) =>
      [...arr].sort(
        (a, b) =>
          ({ HIGH: 0, MEDIUM: 1, LOW: 2 } as const)[a.priority] -
          ({ HIGH: 0, MEDIUM: 1, LOW: 2 } as const)[b.priority]
      )
    )
  );

  selected$ = this.store.selectedCycles$;

  /** View‑model combinado para usar um único async no template */
  vm$ = combineLatest([this.cycles$, this.selected$]).pipe(
    map(([cycles, selected]) => ({ cycles, selected }))
  );


  toggle(cycle: Cycle) {
    this.store.toggleCycle(cycle);
  }

  isSelected(cycle: Cycle, selected: Cycle[]) {
    return selected.some((c) => c.name === cycle.name);
  }
}
