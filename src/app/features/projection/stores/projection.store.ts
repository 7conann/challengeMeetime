import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import {
  ApiResponse,
  Cycle,
  ProjectionDay,
} from '../../../../shared/models/api.models';
import { addBusinessDays, isWeekend } from 'date-fns';
import { ApiService } from '../../../../shared/services/api.service';

interface ProjectionState {
  loading: boolean;
  data: ApiResponse | null;
  selectedCycles: Cycle[];
  entitiesToStart: number;
}

@Injectable()
export class ProjectionStore extends ComponentStore<ProjectionState> {
  constructor(private api: ApiService) {
    super({ loading: true, data: null, selectedCycles: [], entitiesToStart: 1 });
    this.load();
  }

  readonly data$            = this.select((s) => s.data);
  readonly selectedCycles$  = this.select((s) => s.selectedCycles);
  readonly entitiesToStart$ = this.select((s) => s.entitiesToStart);

  readonly chartSeries$ = this.select(
    this.data$,
    this.selectedCycles$,
    this.entitiesToStart$,
    (data, cycles, entities) =>
      data ? buildChartSeries(data.eventsProjection, cycles, entities, nextBusinessDays(5)) : []
  );

  readonly setEntities = this.updater<number>((s, v) => ({ ...s, entitiesToStart: v }));

  readonly toggleCycle = this.updater<Cycle>((s, c) => {
    const exists  = s.selectedCycles.some((x) => x.name === c.name);
    const updated = exists ? s.selectedCycles.filter((x) => x.name !== c.name) : [...s.selectedCycles, c];
    return { ...s, selectedCycles: updated };
  });

  readonly load = this.effect<void>((origin$) =>
    origin$.pipe(
      switchMap(() =>
        this.api.getProjection().pipe(
          tap((resp: ApiResponse) => {
            const high = resp.cycles.filter((c) => c.priority === 'HIGH');
            this.patchState({ data: resp, selectedCycles: high, loading: false });
          }),
          catchError(() => {
            this.patchState({ loading: false });
            return EMPTY;
          })
        )
      )
    )
  );

  getSelectedCycles()  { return this.get().selectedCycles; }
  getEntitiesToStart() { return this.get().entitiesToStart; }
}

function nextBusinessDays(n: number): Date[] {
  const list: Date[] = [];
  let d = new Date();
  while (list.length < n) {
    if (!isWeekend(d)) list.push(d);
    d = addBusinessDays(d, 1);
  }
  return list;
}

function distributeEntities(cycles: Cycle[], entities: number) {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  const sorted = [...cycles].sort((a, b) => order[a.priority] - order[b.priority]);
  const map = new Map<string, number>();
  let left = entities;
  while (left > 0) {
    for (const c of sorted) {
      if (left === 0) break;
      if ((map.get(c.name) ?? 0) < c.availableEntities) {
        map.set(c.name, (map.get(c.name) ?? 0) + 1);
        left--;
      }
    }
  }
  return map;
}

function mergeEvents(base: ProjectionDay[], dist: Map<string, number>, cycles: Cycle[]) {
  const merged = structuredClone(base) as ProjectionDay[];
  for (const [name, qty] of dist) {
    const cycle = cycles.find((c) => c.name === name)!;
    for (let i = 0; i < qty; i++) {
      cycle.structure.forEach((d) => {
        const tgt = merged.find((x) => x.day === d.day)!;
        (['meetings', 'emails', 'calls', 'follows'] as const).forEach((k) => {
          tgt.events[k] += d[k];
        });
      });
    }
  }
  return merged;
}

function buildChartSeries(
  base: ProjectionDay[],
  selected: Cycle[],
  entities: number,
  calendar: Date[]
) {
  const dist   = distributeEntities(selected, entities);
  const merged = mergeEvents(base, dist, selected);
  const cats = ['meetings', 'emails', 'calls', 'follows'] as const;
  return cats.map((c) => ({
    name: c,
    data: calendar.map((_, i) => merged[i].events[c]),
  }));
}
