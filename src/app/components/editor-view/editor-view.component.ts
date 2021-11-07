import { Component, NgZone, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../abstract/abstract-component'
import { FileEntity } from '../../interfaces/File'
import { Tab } from '../../interfaces/Menu'
import { StateService } from '../../services/state.service'
import { filterClosedTab } from '../../utils/tab-utils'

@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrls: ['./editor-view.component.scss'],
})
export class EditorViewComponent extends AbstractComponent implements OnInit {
  files: FileEntity[]
  tabs$: Observable<Tab[]>
  contrastColor: string

  constructor(private state: StateService, public zone: NgZone) {
    super()
  }

  ngOnInit(): void {
    this.files = this.getMockFiles()
    this.tabs$ = this.state.getStatePart('tabs').pipe(takeUntil(this.destroy$))
  }

  getMockFiles(): FileEntity[] {
    const file1: FileEntity = {
      name: 'gitlab-ci.yml',
      extension: 'ts',
      filePath: '/random/',
      tags: [
        { name: 'git', bg: '#e0e0e0', color: 'black' },
        { name: 'code-snippets', bg: '#ff3407', color: 'white' },
        { name: 'work', bg: '#17b74f', color: 'white' },
        { name: 'project', bg: 'black', color: 'white' },
      ],
      iconName: '',
      type: 'file',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditateneque quas! ',
      createdDate: '05.05.2021',
      modifiedDate: '06.06.2021',
    }
    const file2: FileEntity = {
      name: 'random-text.md',
      extension: 'ts',
      filePath: '/random/',
      tags: [{ name: 'random', bg: '#e0e0e0', color: 'black' }],
      iconName: '',
      type: 'file',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditateneque quas!',
      createdDate: '12.01.2020',
      modifiedDate: '06.06.2021',
    }
    const secondaryFiles = Array.from(Array(5)).map(() => file2)
    console.log(secondaryFiles)

    return [file1, ...secondaryFiles]
  }

  onCloseTab(event: { filePath: string }): void {
    const selectedTab = this.state.getStatePartValue('selectedTab')
    const currentTabs = this.state.getStatePartValue('tabs')
    const newTabs = filterClosedTab(currentTabs, event.filePath)
    const newIndex = selectedTab - 1 >= 0 ? selectedTab - 1 : 0

    this.state.updateState$.next({ key: 'selectedTab', payload: newIndex })
    this.state.updateState$.next({ key: 'tabs', payload: newTabs })
  }
}
