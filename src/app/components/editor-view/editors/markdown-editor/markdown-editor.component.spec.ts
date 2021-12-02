import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MarkdownEditorViewComponent } from './markdown-editor.component'

describe('MarkdownEditorComponent', () => {
  let component: MarkdownEditorViewComponent
  let fixture: ComponentFixture<MarkdownEditorViewComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkdownEditorViewComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownEditorViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
