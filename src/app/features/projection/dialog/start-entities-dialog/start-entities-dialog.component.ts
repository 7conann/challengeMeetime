import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importar MatSnackBar e MatSnackBarModule

import { CyclesTableComponent } from '../../components/cycles-table/cycles-table.component';
import { ProjectionChartComponent } from '../../components/projection-chart/projection-chart.component';
import { ProjectionStore } from '../../stores/projection.store';

@Component({
  standalone: true,
  selector: 'app-start-entities-dialog',
  templateUrl: './start-entities-dialog.component.html',
  styleUrls: ['./start-entities-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CyclesTableComponent,
    ProjectionChartComponent,
    MatDialogModule,
    MatSnackBarModule,
  ],
  providers: [ProjectionStore],
})
export class StartEntitiesDialogComponent {
  tableOpen = false;
  maxEntities = 0;

  private readonly snackBar = inject(MatSnackBar); // Injetar MatSnackBar

  readonly store = inject(ProjectionStore);
  readonly todayEvents$ = this.store.todayEvents$;

  readonly entitiesCtrl = new FormControl(1, {
    nonNullable: true,
    validators: [Validators.min(1)],
  });

  readonly startDisabled$ = this.store.selectedCycles$.pipe(
    map((c) => c.length === 0),
  );

  readonly maxEntities$ = this.store.selectedCycles$.pipe(
    map((cycles) => cycles.reduce((sum, cycle) => sum + cycle.availableEntities, 0))
  );

  toggleTable() {
    this.tableOpen = !this.tableOpen;
  }

  constructor() {
    this.store.selectedCycles$.subscribe((cycles) => {
      this.maxEntities = cycles.reduce((sum, cycle) => sum + cycle.availableEntities, 0);
      this.entitiesCtrl.addValidators(Validators.max(this.maxEntities));
      this.entitiesCtrl.updateValueAndValidity();
    });
  }

  updateEntities(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (value > this.maxEntities) {
      this.entitiesCtrl.setErrors({ max: true });
      this.snackBar.open(
        `O valor não pode exceder ${this.maxEntities}.`,
        'Fechar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      return;
    }

    if (value > this.maxEntities) {
      this.entitiesCtrl.setErrors({ max: true });
      return;
    }
    this.store.setEntities(value);
  }

}
