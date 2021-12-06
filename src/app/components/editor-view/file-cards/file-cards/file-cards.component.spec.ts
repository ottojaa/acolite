import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileCardsComponent } from './file-cards.component';

describe('FileCardsComponent', () => {
  let component: FileCardsComponent;
  let fixture: ComponentFixture<FileCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
