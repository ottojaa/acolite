import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDirectoryDialogComponent } from './change-directory-dialog.component';

describe('ChangeDirectoryDialogComponent', () => {
  let component: ChangeDirectoryDialogComponent;
  let fixture: ComponentFixture<ChangeDirectoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeDirectoryDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeDirectoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
