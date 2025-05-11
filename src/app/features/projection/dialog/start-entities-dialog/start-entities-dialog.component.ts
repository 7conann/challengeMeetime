import { Component, inject } from '@angular/core';
import { CommonModule }      from '@angular/common';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule }   from '@angular/material/button';
import { MatDividerModule }  from '@angular/material/divider';
import { MatFormFieldModule }from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatIconModule }     from '@angular/material/icon';

import { map, startWith } from 'rxjs';

import { CyclesTableComponent }     from '../../components/cycles-table/cycles-table.component';
import { ProjectionChartComponent } from '../../components/projection-chart/projection-chart.component';
import { ProjectionStore }          from '../../stores/projection.store';

@Component({
  standalone: true,
  selector: 'app-start-entities-dialog',
  templateUrl: './start-entities-dialog.component.html',
  styleUrls: ['./start-entities-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CyclesTableComponent,
    ProjectionChartComponent,
  ],
  providers: [ProjectionStore],
})
export class StartEntitiesDialogComponent {
  private dialogRef = inject(MatDialogRef<StartEntitiesDialogComponent>, {
    optional: true,
  });
  readonly store = inject(ProjectionStore);

  /** form input */
  readonly entitiesCtrl = new FormControl(1, {
    nonNullable: true,
    validators: [Validators.min(1)],
  });

  /** UI state */
  tableOpen = false;
  toggleTable() { this.tableOpen = !this.tableOpen; }

  /** derived data */
  todayEvents = this.store.chartSeries$.pipe(
    map((s) => s?.reduce((sum, serie) => sum + (serie.data[0] as number), 0) ?? 0),
    startWith(0)
  );

  startDisabled$ = this.store.selectedCycles$.pipe(
    map((c) => c.length === 0)
  );

  constructor() {
    this.entitiesCtrl.valueChanges.subscribe((v) => this.store.setEntities(v ?? 1));
  }

  close() {
    this.dialogRef?.close();
  }

  start() {
    this.dialogRef?.close({
      cycles:   this.store.getSelectedCycles(),
      entities: this.store.getEntitiesToStart(),
    });
  }
}
