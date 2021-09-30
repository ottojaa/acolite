import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundedIconButtonComponent } from './rounded-icon-button.component';

describe('RoundedIconButtonComponent', () => {
  let component: RoundedIconButtonComponent;
  let fixture: ComponentFixture<RoundedIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundedIconButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundedIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
