import { Component, OnInit } from '@angular/core'
import { FileEntity } from '../../interfaces/File'

@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrls: ['./editor-view.component.scss'],
})
export class EditorViewComponent implements OnInit {
  files: FileEntity[]
  tabs: any[]
  contrastColor: string

  constructor() {}

  ngOnInit(): void {
    this.files = this.getMockFiles()
    this.tabs = this.getMockTabs()
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

  onCloseTab(event: { tabName: string; index: number }): void {
    this.tabs = [...this.tabs.filter((tab) => tab.name !== event.tabName)]
  }

  getMockTabs(): any {
    return [
      {
        tabType: 0,
        name: 'Main',
      },
      {
        tabType: 1,
        name: 'Dashboard',
      },
      {
        tabType: 2,
        name: 'Tests',
      },
    ]
  }
}
