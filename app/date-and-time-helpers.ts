import { format, formatDistance } from 'date-fns'

export const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

export const getDistance = (date: Date) => {
  return 'Last updated ' + formatDistance(date, new Date(), { includeSeconds: true }) + ' ago'
}
