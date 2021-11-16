import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { delay, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../abstract/abstract-component'
import { FileEntity } from '../../interfaces/File'
import { Tab } from '../../interfaces/Menu'
import { StateService } from '../../services/state.service'
import { TabService } from '../../services/tab.service'

@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrls: ['./editor-view.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms 0ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class EditorViewComponent extends AbstractComponent implements OnInit {
  files: FileEntity[]
  tabs$: Observable<Tab[]>
  initialized$: Observable<boolean>
  contrastColor: string

  constructor(private state: StateService, public tabService: TabService) {
    super()
  }

  ngOnInit(): void {
    this.initialized$ = this.state.getStatePart('initialized').pipe(delay(350)) // Delay because showing the spinner for e.g 20ms looks wonky in case the app loads quickly
    this.tabs$ = this.state.getStatePart('tabs').pipe(takeUntil(this.destroy$))
    this.files = this.getMockFiles()
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

    return [file1, ...secondaryFiles]
  }
}
