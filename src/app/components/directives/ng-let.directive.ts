import { Directive, OnInit, Input, ViewContainerRef, TemplateRef } from '@angular/core'

export class NgLetContext<T = any> {
  $implicit: T = null!
  ngLet: T = null!
}

@Directive({
  selector: '[ngLet]',
})
export class NgLetDirective<T> implements OnInit {
  private _context = new NgLetContext<T>()

  @Input()
  set ngLet(value: T) {
    this._context.$implicit = this._context.ngLet = value
  }

  constructor(private _vcr: ViewContainerRef, private _templateRef: TemplateRef<NgLetContext>) {}

  static ngTemplateContextGuard<T>(_dir: NgLetDirective<T>, _ctx: unknown): _ctx is NgLetContext<T> {
    return true
  }

  ngOnInit() {
    this._vcr.createEmbeddedView(this._templateRef, this._context)
  }
}
