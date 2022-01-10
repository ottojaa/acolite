import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoUpdaterComponent } from './auto-updater.component';

describe('AutoUpdaterComponent', () => {
  let component: AutoUpdaterComponent;
  let fixture: ComponentFixture<AutoUpdaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoUpdaterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoUpdaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
