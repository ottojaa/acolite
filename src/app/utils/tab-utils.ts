import { Tab } from '../interfaces/Menu'

export const filterClosedTab = (tabs: Tab[], tabToClose: string) => tabs.filter((tab) => tab.path !== tabToClose)
