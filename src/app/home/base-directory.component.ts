import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AppDialogService } from '../services/dialog.service'

@Component({
  selector: 'app-home',
  templateUrl: './base-directory.component.html',
  styleUrls: ['./base-directory.component.scss'],
})
export class BaseDirectoryComponent implements OnInit {
  constructor(private dialogService: AppDialogService, private router: Router) {}

  ngOnInit(): void {
    this.dialogService.openWorkspaceDirectoryDialog().subscribe(() => this.router.navigate(['main']))
  }
}
