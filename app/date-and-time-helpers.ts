import { format, formatDistance, parseISO } from 'date-fns'

export const formatDate = (date: Date | string) => {
  if (typeof date === 'string') {
    return format(parseISO(date), 'yyyy-MM-dd')
  }
  return format(date, 'yyyy-MM-dd')
}

export const getDistance = (date: Date) => {
  return 'Last updated ' + formatDistance(date, new Date(), { includeSeconds: true }) + ' ago'
}
