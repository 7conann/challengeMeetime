import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CyclesTableComponent } from './cycles-table.component';

describe('CyclesTableComponent', () => {
  let component: CyclesTableComponent;
  let fixture: ComponentFixture<CyclesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CyclesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CyclesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
