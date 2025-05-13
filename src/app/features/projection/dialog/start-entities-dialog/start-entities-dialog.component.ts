import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { map, Subject, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
export class StartEntitiesDialogComponent implements OnInit, OnDestroy {
  tableOpen = false;
  maxEntities = 0;

  private readonly snackBar = inject(MatSnackBar);
  private readonly store = inject(ProjectionStore);
  private readonly destroy$ = new Subject<void>();

  readonly todayEvents$ = this.store.todayEvents$;

  readonly entitiesCtrl = new FormControl(1, {
    nonNullable: true,
    validators: [Validators.min(1)],
  });

  readonly startDisabled$ = this.store.selectedCycles$.pipe(
    map((c) => c.length === 0),
  );

  readonly maxEntities$ = this.store.selectedCycles$.pipe(
    map((cycles) => cycles.reduce((sum, cycle) => sum + cycle.availableEntities, 0)),
    takeUntil(this.destroy$)
  );

  toggleTable() {
    this.tableOpen = !this.tableOpen;
  }

  ngOnInit(): void {
    this.maxEntities$.subscribe((newMaxEntities) => {
      this.maxEntities = newMaxEntities;
      const currentValidators = [Validators.min(1)];

      if (newMaxEntities > 0) {
        currentValidators.push(Validators.max(newMaxEntities));
        if (this.entitiesCtrl.disabled) {
          this.entitiesCtrl.enable({ emitEvent: false });
        }
      } else {
        currentValidators.push(Validators.max(0));
        if (this.entitiesCtrl.enabled) {
          this.entitiesCtrl.disable({ emitEvent: false });
        }
      }
      this.entitiesCtrl.setValidators(currentValidators);
      this.entitiesCtrl.updateValueAndValidity({ emitEvent: false });

      let valueToSet = this.entitiesCtrl.value;

      if (this.entitiesCtrl.enabled) {
        if (valueToSet < 1) {
          valueToSet = 1;
        }
        if (valueToSet > newMaxEntities) {
          valueToSet = newMaxEntities;
        }
      } else {
        valueToSet = 0;
      }

      if (this.entitiesCtrl.value !== valueToSet) {
        this.entitiesCtrl.setValue(valueToSet, { emitEvent: false });
      }
      this.store.setEntities(valueToSet);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateEntities(event: Event): void {
    if (this.entitiesCtrl.disabled) {
      return;
    }

    const inputElement = event.target as HTMLInputElement;
    const numericValue = Number(inputElement.value);
    let correctedValue = numericValue;

    if (isNaN(numericValue) || numericValue < 1) {
      correctedValue = 1;
    }

    if (correctedValue > this.maxEntities) {
      correctedValue = this.maxEntities;
      this.snackBar.open(
        `O valor não pode exceder ${this.maxEntities}.`,
        'Fechar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
    }

    if (String(correctedValue) !== inputElement.value) {
      this.entitiesCtrl.setValue(correctedValue, { emitEvent: false });
    }

    this.store.setEntities(correctedValue);
  }
}
