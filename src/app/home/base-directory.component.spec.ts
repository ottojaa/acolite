import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BaseDirectoryComponent } from './base-directory.component'
import { TranslateModule } from '@ngx-translate/core'
import { RouterTestingModule } from '@angular/router/testing'

describe('BaseDirectoryComponent', () => {
  let component: BaseDirectoryComponent
  let fixture: ComponentFixture<BaseDirectoryComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BaseDirectoryComponent],
        imports: [TranslateModule.forRoot(), RouterTestingModule],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDirectoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it(
    'should render title in a h1 tag',
    waitForAsync(() => {
      const compiled = fixture.debugElement.nativeElement
      expect(compiled.querySelector('h1').fileContent).toContain('PAGES.HOME.TITLE')
    })
  )
})
