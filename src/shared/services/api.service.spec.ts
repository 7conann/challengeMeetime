import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ApiService } from './api.service';
import { ApiResponse, Cycle, ProjectionDay } from '../models/api.models';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjection (Mocked Data)', () => {
    const MOCK_DELAY_MS = 500;

    it(`should return mocked ApiResponse data after ${MOCK_DELAY_MS}ms delay`, fakeAsync(() => {
      let actualResponse: ApiResponse | undefined;
      let isCompleted = false;

      service.getProjection().subscribe({
        next: (data) => actualResponse = data,
        complete: () => isCompleted = true
      });

      expect(actualResponse).toBeUndefined();
      expect(isCompleted).toBeFalse();

      tick(MOCK_DELAY_MS);

      expect(isCompleted).toBeTrue();
      expect(actualResponse).toBeDefined();

      if (actualResponse) {
        expect(actualResponse.eventsProjection).toBeInstanceOf(Array);
        expect(actualResponse.eventsProjection.length).toBeGreaterThan(0);
        expect(actualResponse.cycles).toBeInstanceOf(Array);
        expect(actualResponse.cycles.length).toBeGreaterThanOrEqual(6);

        const firstEventProjection = actualResponse.eventsProjection[0] as ProjectionDay;
        expect(firstEventProjection.day).toBe(1);
        expect(firstEventProjection.events).toEqual(jasmine.objectContaining({ meetings: 32, emails: 10 }));

        const firstCycle = actualResponse.cycles[0] as Cycle;
        expect(firstCycle.name).toBe('Ciclo 1');
        expect(firstCycle.priority).toBe('HIGH');
        expect(firstCycle.availableEntities).toBe(1);

        const sixthCycle = actualResponse.cycles.find(c => c.name === 'Ciclo 6') as Cycle;
        expect(sixthCycle).toBeDefined();
        expect(sixthCycle.availableEntities).toBe(0);
      }
    }));

    it('should ensure all cycles in the mock have a structure array', fakeAsync(() => {
      let actualResponse: ApiResponse | undefined;
      service.getProjection().subscribe(data => actualResponse = data);
      tick(MOCK_DELAY_MS);

      expect(actualResponse).toBeDefined();
      if (actualResponse?.cycles) {
        actualResponse.cycles.forEach(cycle => {
          expect(cycle.structure).toBeInstanceOf(Array);
        });
      }
    }));
  });
});
