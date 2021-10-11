import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDirectoryDialogComponent } from './base-directory-dialog.component';

describe('BaseDirectoryDialogComponent', () => {
  let component: BaseDirectoryDialogComponent;
  let fixture: ComponentFixture<BaseDirectoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseDirectoryDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDirectoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
