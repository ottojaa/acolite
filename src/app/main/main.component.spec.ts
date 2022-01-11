import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { MainComponent } from './main.component'
import { TranslateModule } from '@ngx-translate/core'

import { RouterTestingModule } from '@angular/router/testing'

describe('DetailComponent', () => {
  let component: MainComponent
  let fixture: ComponentFixture<MainComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MainComponent],
        imports: [TranslateModule.forRoot(), RouterTestingModule],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent)
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
      expect(compiled.querySelector('h1').fileContent).toContain('PAGES.DETAIL.TITLE')
    })
  )
})
