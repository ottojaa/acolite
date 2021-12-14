import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SortableFileListComponent } from './sortable-file-table.component'

describe('SortableFileListComponent', () => {
  let component: SortableFileListComponent
  let fixture: ComponentFixture<SortableFileListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SortableFileListComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(SortableFileListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
