/// <reference types='zone.js/dist/zone.js' />

/**
 * Primeng Tree has terrible performance when dragging nodes over other nodes, as the dragover / dragenter events trigger angular digest cycle.
 * -> run blacklisted events outside of angular zone to circumvent this.
 * Fix from https://stackoverflow.com/questions/43108155/angular-2-how-to-keep-event-from-triggering-digest-loop-detection-cycle
 */

const BLACKLISTED_ZONE_EVENTS: string[] = ['addEventListener:dragover', 'addEventListener:dragenter']

export const blacklistZone = Zone.current.fork({
  name: 'blacklist',
  onScheduleTask: (delegate: ZoneDelegate, _current: Zone, target: Zone, task: Task): Task => {
    // Blacklist scroll, mouse, and request animation frame events.
    if (task.type === 'eventTask' && BLACKLISTED_ZONE_EVENTS.some((name) => task.source.indexOf(name) > -1)) {
      task.cancelScheduleRequest()

      // Schedule task in root zone, note Zone.root != target,
      // "target" Zone is Angular. Scheduling a task within Zone.root will
      // prevent the infinite digest cycle from appearing.
      return Zone.root.scheduleTask(task)
    } else {
      return delegate.scheduleTask(target, task)
    }
  },
})
