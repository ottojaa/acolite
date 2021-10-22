import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFilesDialogComponent } from './delete-files-dialog.component';

describe('DeleteFilesDialogComponent', () => {
  let component: DeleteFilesDialogComponent;
  let fixture: ComponentFixture<DeleteFilesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteFilesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteFilesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
