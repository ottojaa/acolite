import { Component, OnInit } from '@angular/core'
import { FileEntity } from '../../interfaces/File'

@Component({
  selector: 'app-default-view',
  templateUrl: './default-view.component.html',
  styleUrls: ['./default-view.component.scss'],
})
export class DefaultViewComponent implements OnInit {
  files: FileEntity[]
  constructor() {}

  ngOnInit(): void {
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
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditateneque quas!',
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
}
