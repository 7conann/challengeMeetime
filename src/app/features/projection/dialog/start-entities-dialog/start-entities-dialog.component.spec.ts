import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartEntitiesDialogComponent } from './start-entities-dialog.component';

describe('StartEntitiesDialogComponent', () => {
  let component: StartEntitiesDialogComponent;
  let fixture: ComponentFixture<StartEntitiesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartEntitiesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartEntitiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
