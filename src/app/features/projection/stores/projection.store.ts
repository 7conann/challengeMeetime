import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { switchMap, tap, catchError, map, shareReplay, distinctUntilChanged,} from 'rxjs/operators';
import { combineLatest, EMPTY } from 'rxjs';
import { ApiResponse, Cycle, EventBreakdown, ProjectionDay,} from '../../../../shared/models/api.models';
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
  getData() {
    return this.get().data;
  }
   getSelectedCycles() {
    return this.get().selectedCycles;
  }

    readonly data$ = this.select((s) => s.data);
    readonly selectedCycles$  = this.select((s) => s.selectedCycles);
    readonly entitiesToStart$ = this.select((s) => s.entitiesToStart);

    readonly todayEvents$ = combineLatest([
      this.selectedCycles$,
      this.entitiesToStart$,
    ]).pipe(
      map(([selectedCycles, entitiesToStart]) => {

        if (!selectedCycles || selectedCycles.length === 0 || entitiesToStart === 0) {
          return 0;
        }

        const todayActual = new Date();
        let todayWeekday = todayActual.getDay();

        if (todayWeekday === 0 || todayWeekday === 6) {
          todayWeekday = 1;
        }

        let totalAddedEventsForToday = 0;

        const distributedEntitiesMap = distributeEntities(selectedCycles, entitiesToStart);

        if (distributedEntitiesMap.size > 0) {
          for (const [cycleName, numEntitiesInCycle] of distributedEntitiesMap) {
            const cycleDetails = selectedCycles.find(c => c.name === cycleName);

            if (!cycleDetails || !cycleDetails.structure) {
              continue;
            }

            for (let i = 0; i < numEntitiesInCycle; i++) {

              cycleDetails.structure.forEach(eventInCycleStructure => {

                if (eventInCycleStructure.day === todayWeekday) {
                  totalAddedEventsForToday += (eventInCycleStructure.meetings || 0) +
                                              (eventInCycleStructure.emails || 0) +
                                              (eventInCycleStructure.calls || 0) +
                                              (eventInCycleStructure.follows || 0);
                }
              });
            }
          }
        }
        return totalAddedEventsForToday;
      }),
      distinctUntilChanged(),
      shareReplay(1),
    );

  readonly chartSeries$ = combineLatest([
    this.data$,
    this.selectedCycles$,
    this.entitiesToStart$,
  ]).pipe(
    map(([data, cycles, entities]) => {
      if (!data?.eventsProjection) {
        const emptyBase: ProjectionDay[] = [];
        const safeCycles = Array.isArray(cycles) ? cycles : [];
        return buildChartSeries(emptyBase, safeCycles, entities, nextBusinessDays(5));
      }
      if (!data.eventsProjection.length && (!cycles || cycles.length === 0)) {
        return [];
      }

      const safeCycles = Array.isArray(cycles) ? cycles : [];
      const series = buildChartSeries(data.eventsProjection, safeCycles, entities, nextBusinessDays(5));
      return series;
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );


  readonly setEntities = this.updater<number>((state, value) => {
    return {
      ...state,
      entitiesToStart: Math.max(0, value),
    };
  });

  readonly toggleCycle = this.updater<Cycle>((state, cycle) => {
    const exists = state.selectedCycles.some((x) => x.name === cycle.name);
    const updatedCycles = exists
      ? state.selectedCycles.filter((x) => x.name !== cycle.name)
      : [...state.selectedCycles, cycle];

    return {
      ...state,
      selectedCycles: updatedCycles,
    };
  });

  readonly load = this.effect<void>((origin$) =>
    origin$.pipe(
      switchMap(() =>
        this.api.getProjection().pipe(
          tap((resp) => {
            const high = resp.cycles.filter((c) => c.priority === 'HIGH');
            this.patchState({ data: resp, selectedCycles: high, loading: false });
          }),
          catchError(() => {
            this.patchState({ loading: false });
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  getEntitiesToStart() { return this.get().entitiesToStart; }
}

export function nextBusinessDays(n: number): Date[] {
  const list: Date[] = [];
  let currentDate = new Date();
  while (list.length < n) {
    if (!isWeekend(currentDate)) {
      list.push(new Date(currentDate));
    }
    currentDate = addBusinessDays(currentDate, 1);
  }
  return list;
}

export function distributeEntities(cycles: Cycle[], entities: number): Map<string, number> {
  const result = new Map<string, number>();

  if (!cycles || cycles.length === 0 || entities === 0) {
    return result;
  }

  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  const sortedCycles = [...cycles].sort((a, b) => order[a.priority] - order[b.priority]);

  let remainingEntities = entities;
  let allCyclesAtMaxCapacity = false;

  while (remainingEntities > 0 && !allCyclesAtMaxCapacity) {
    let entitiesDistributedInThisPass = 0;
    for (const cycle of sortedCycles) {
      if (remainingEntities === 0) break;

      const currentAllocation = result.get(cycle.name) ?? 0;
      if (currentAllocation < cycle.availableEntities) {
        result.set(cycle.name, currentAllocation + 1);
        remainingEntities--;
        entitiesDistributedInThisPass++;
      }
    }
    if (entitiesDistributedInThisPass === 0) {
      allCyclesAtMaxCapacity = true;
    }
  }
  return result;
}

export function buildChartSeries(
  apiEventsProjection: ProjectionDay[],
  selectedCycles: Cycle[],
  entitiesToStart: number,
  displayCalendar: Date[],
) {
  const getWeekdayNumber = (date: Date): (1 | 2 | 3 | 4 | 5 | undefined) => {
    const day = date.getDay();
    if (day >= 1 && day <= 5) return day as (1 | 2 | 3 | 4 | 5);
    return undefined;
  };

  const baseProjectionForDisplay: ProjectionDay[] = displayCalendar.map(dateInCalendar => {
    const weekdayOfDateInCalendar = getWeekdayNumber(dateInCalendar);
    const apiDayData = apiEventsProjection.find(p => p.day === weekdayOfDateInCalendar);
    return {
      day: weekdayOfDateInCalendar || 1,
      events: apiDayData ? structuredClone(apiDayData.events) : { meetings: 0, emails: 0, calls: 0, follows: 0 }
    };
  });

  const finalProjectionForDisplay: ProjectionDay[] = structuredClone(baseProjectionForDisplay);

  if (selectedCycles.length > 0 && entitiesToStart > 0) {
    const distributedEntitiesMap = distributeEntities(selectedCycles, entitiesToStart);

    if (distributedEntitiesMap.size > 0) {
      for (const [cycleName, numEntitiesInCycle] of distributedEntitiesMap) {
        const cycle = selectedCycles.find(c => c.name === cycleName);
        if (!cycle) {
          continue;
        }

        for (let i = 0; i < numEntitiesInCycle; i++) {
          cycle.structure.forEach(eventInCycleStructure => {
            const displayDayIndex = displayCalendar.findIndex(
              calDate => getWeekdayNumber(calDate) === eventInCycleStructure.day
            );

            if (displayDayIndex !== -1) {
              const targetDisplayDayEvents = finalProjectionForDisplay[displayDayIndex].events;
              (['meetings', 'emails', 'calls', 'follows'] as const).forEach(key => {
                targetDisplayDayEvents[key] += eventInCycleStructure[key];
              });
            }
          });
        }
      }
    }
  }

  const categories: (keyof EventBreakdown)[] = ['meetings', 'emails', 'calls', 'follows'];
  return categories.map(category => ({
    name: category,
    data: finalProjectionForDisplay.map(projectionDay => projectionDay.events[category] ?? 0),
  }));
}
