import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTabsComponent } from './file-tabs.component';

describe('FileTabsComponent', () => {
  let component: FileTabsComponent;
  let fixture: ComponentFixture<FileTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
