import { trigger, state, style, transition, animate, keyframes } from '@angular/animations'
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { Tab } from '../../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-sortable-file-list',
  templateUrl: './sortable-file-table.component.html',
  styleUrls: ['./sortable-file-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('componentLoaded', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(
          '.3s ease-in',
          keyframes([
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            style({ opacity: 1, transform: 'translateX(0)' }),
          ])
        ),
      ]),
    ]),
  ],
})
export class SortableFileListComponent implements AfterViewInit {
  @Input() set files(files: Tab[]) {
    this.dataSource.data = files
  }
  @Input() basePath: string

  displayedColumns: string[] = ['fileName', 'createdAt', 'modifiedAt', 'filePath']
  dataSource: MatTableDataSource<Tab>
  expandedElement: Tab | null

  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort

  constructor() {
    this.dataSource = new MatTableDataSource([])
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLocaleLowerCase()
      }

      return data[sortHeaderId]
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }
}
