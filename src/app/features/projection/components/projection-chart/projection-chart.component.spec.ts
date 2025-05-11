import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionChartComponent } from './projection-chart.component';

describe('ProjectionChartComponent', () => {
  let component: ProjectionChartComponent;
  let fixture: ComponentFixture<ProjectionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
