import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { TreeNode } from 'primeng/api'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient) {}

  async getMenuItems() {
    const res = await this.http.get<any>('./assets/files.json').toPromise()
    return <TreeNode[]>res.data
  }

  generateMenuItemsFromFolderStruct(): any {}
}
