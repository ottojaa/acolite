import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBuilderDialogComponent } from './search-builder-dialog.component';

describe('SearchBuilderDialogComponent', () => {
  let component: SearchBuilderDialogComponent;
  let fixture: ComponentFixture<SearchBuilderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchBuilderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBuilderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
