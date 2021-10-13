import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileCreationComponent } from './file-creation.component';

describe('FileCreationComponent', () => {
  let component: FileCreationComponent;
  let fixture: ComponentFixture<FileCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
