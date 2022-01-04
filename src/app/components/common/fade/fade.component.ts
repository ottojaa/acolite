import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

export type FadeState = 'visible' | 'hidden'

/**
 * Dynamically shows content that are passed to this component via ng-content selectors, which means that the different
 * component states are defined in the template that declares this component.
 *
 * Has 3 different component parameters:
 *  1. [loader], shown when content is not yet done loading
 *  2. [content], shown when loading animation is finished
 *  3. [noContent], shown when loading is finished but the parent set noContent input as true
 */
@Component({
  selector: 'app-fade',
  templateUrl: './fade.component.html',
  styleUrls: ['./fade.component.scss'],
  animations: [
    trigger('state', [
      state(
        'visible',
        style({
          opacity: '1',
        })
      ),
      state(
        'hidden',
        style({
          opacity: '0',
        })
      ),
      transition('* => visible', [animate('500ms ease-out')]),
      transition('visible => hidden', [animate('500ms ease-out')]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  state: FadeState
  loaderState: FadeState
  noContentState: FadeState

  private _show: boolean
  private _animating: boolean

  get show() {
    return this._show
  }

  get animating() {
    return this._animating
  }

  @Input() noContent: boolean
  @Input()
  set show(value: boolean) {
    if (value) {
      this._show = value
      this.state = 'visible'
    } else {
      this.state = 'hidden'
    }
  }

  animationDone(event: AnimationEvent) {
    this._animating = false
    if (event.fromState === 'visible' && event.toState === 'hidden') {
      this._show = false
    }
  }

  animationStarted(): void {
    this._animating = true
  }
}
