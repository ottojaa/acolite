import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveFilesDialogComponent } from './move-files-dialog.component';

describe('MoveFilesDialogComponent', () => {
  let component: MoveFilesDialogComponent;
  let fixture: ComponentFixture<MoveFilesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveFilesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveFilesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
