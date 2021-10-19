import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FolderCreationDialogComponent } from './folder-creation-dialog.component'

describe('FolderCreationDialogComponent', () => {
  let component: FolderCreationDialogComponent
  let fixture: ComponentFixture<FolderCreationDialogComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FolderCreationDialogComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderCreationDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
