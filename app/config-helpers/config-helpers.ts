import * as fs from 'fs'
import { first, reject } from 'lodash'
import { resolve } from 'path/posix'
import { allowedConfigKeys } from '../../src/app/entities/file/constants'
import { getBaseName, getExtensionSplit } from '../../src/app/utils/file-utils'
import { WorkspaceConfig, AppConfig, Tab } from '../electron-interfaces'

export const getDefaultConfigJSON = (workspacePath?: string): string => {
  if (!workspacePath) {
    return JSON.stringify({ workspaces: [] }, null, 2)
  }
  return JSON.stringify({ selectedWorkspace: workspacePath, workspaces: [{ baseDir: workspacePath }] }, null, 2)
}

export const changeSelectedWorkspace = (newWorkspacePath: string, configPath: string): Promise<WorkspaceConfig> => {
  return new Promise((resolve, reject) => {
    readConfigData(configPath).then(
      (configData) => {
        const { workspaces } = configData
        const newWorkspaceIndex = workspaces.findIndex((workspace) => workspace.baseDir === newWorkspacePath)
        const updatedWorkspaces = newWorkspaceIndex > -1 ? workspaces : [...workspaces, { baseDir: newWorkspacePath }]
        const data = { selectedWorkspace: newWorkspacePath, workspaces: updatedWorkspaces }

        writeConfigData(configPath, data).then(
          () => {
            const workspaceData = getSelectedWorkspaceConfig(data)
            resolve(workspaceData)
          },
          (err) => {
            reject(err)
          }
        )
      },
      (err) => {
        console.error(err)
        reject(err)
      }
    )
  })
}

const getSelectedWorkspaceConfig = (config: AppConfig): WorkspaceConfig => {
  const { selectedWorkspace, workspaces } = config
  const data = workspaces.find((workspace) => workspace.baseDir === selectedWorkspace)

  return data || {}
}

export const updateSelectedWorkspaceConfig = (updateData: WorkspaceConfig, configPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    readConfigData(configPath).then((configData) => {
      const { selectedWorkspace, workspaces } = configData
      const workspaceIndex = workspaces.findIndex((workspace) => workspace.baseDir === selectedWorkspace)

      if (workspaceIndex > -1) {
        const workspaceToUpdate = workspaces[workspaceIndex]
        workspaces[workspaceIndex] = { ...workspaceToUpdate, ...updateData }
      } else {
        reject(`Workspace config not found for path ${selectedWorkspace}`)
      }

      const payload: AppConfig = { selectedWorkspace, workspaces }

      writeConfigData(configPath, payload).then(
        () => {
          resolve(selectedWorkspace)
        },
        (err) => {
          reject(err)
        }
      )
    })
  })
}

const readConfigData = (configPath: string): Promise<AppConfig> => {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, 'utf-8', (err, configData) => {
      if (err) {
        reject(err)
      }
      const parsedData = JSON.parse(configData) as AppConfig
      resolve(parsedData)
    })
  })
}

const writeConfigData = (configPath: string, data: AppConfig): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data, null, 2)

    fs.writeFile(configPath, payload, (err) => {
      if (err) {
        reject()
      }
      resolve(configPath)
    })
  })
}

export const validateAppConfig = (config: AppConfig): AppConfig => {
  const { selectedWorkspace, workspaces } = config
  if (!workspaces?.length) {
    return { workspaces: [] }
  }

  const validatedWorkspaces = workspaces.reduce((acc, curr) => {
    acc.push(validateAndUpdateConfig(curr))

    return acc
  }, [])

  const selectedWorkSpaceIsValid = workspaces.findIndex((workspace) => workspace.baseDir === selectedWorkspace) > -1

  return {
    selectedWorkspace: selectedWorkSpaceIsValid ? selectedWorkspace : first(workspaces).baseDir,
    workspaces: validatedWorkspaces,
  }
}

/**
 * Validates whether the values stored in the persistent appConfig makes sense, if not, return default value for that field
 * @param config persistent appConfig
 * @returns validated appConfig
 */
export const validateAndUpdateConfig = (workspaceConfig: WorkspaceConfig): WorkspaceConfig => {
  const validatedConfigVal = <K extends keyof WorkspaceConfig>(key: K) => {
    switch (key) {
      case 'tabs': {
        return validateTabs(workspaceConfig)
      }
      case 'baseDir': {
        return validateBaseDir(workspaceConfig)
      }
      case 'sideMenuWidth': {
        return validateSideMenuWidth(workspaceConfig)
      }
      case 'selectedTab': {
        return validateSelectedTab(workspaceConfig)
      }
      case 'editorTheme': {
        return validateEditorTheme(workspaceConfig)
      }
      case 'searchPreferences': {
        return validateSearchPreferences(workspaceConfig)
      }
      default: {
        break
      }
    }
  }
  const allowedKeys = allowedConfigKeys
  const keys = Object.keys(workspaceConfig).filter((key: any) => allowedKeys.includes(key)) as (keyof WorkspaceConfig)[]

  return keys.reduce((acc, curr) => {
    acc[curr] = validatedConfigVal(curr)
    return acc
  }, {})
}

const validateTabs = (config: WorkspaceConfig) => {
  const getTabData = (path: string) => {
    if (!fs.existsSync(path)) {
      return null
    }
    const content = fs.readFileSync(path, 'utf-8')
    const fileStats = fs.statSync(path)
    return <Tab>{
      fileName: getBaseName(path),
      extension: getExtensionSplit(path),
      path,
      textContent: content,
      data: {
        lastUpdated: fileStats.mtime,
      },
    }
  }
  return config.tabs.map((tab) => getTabData(tab.path)).filter((tab) => !!tab)
}

const validateBaseDir = (config: WorkspaceConfig) => {
  const { baseDir } = config

  const isValid = typeof baseDir === 'string' && fs.existsSync(baseDir)
  return isValid ? baseDir : ''
}

const validateSideMenuWidth = (config: WorkspaceConfig) => {
  const { sideMenuWidth } = config
  const defaultValue = 20
  if (typeof sideMenuWidth === 'number') {
    const isValidWidth = sideMenuWidth >= 0 && sideMenuWidth <= 100
    return isValidWidth ? sideMenuWidth : defaultValue
  }
  return defaultValue
}

const validateEditorTheme = (config: WorkspaceConfig) => {
  const { editorTheme } = config
  const isValid = editorTheme === 'dark' || editorTheme === 'light'

  return isValid ? editorTheme : 'dark'
}

const validateSelectedTab = (config: WorkspaceConfig) => {
  const { tabs, selectedTab } = config
  const isValid = tabs.findIndex((tab) => tab.path === selectedTab.path) > -1
  return isValid ? selectedTab : 0
}

const validateSearchPreferences = (config: WorkspaceConfig) => {
  const { searchPreferences } = config
  const isValid = searchPreferences.every((preference) => preference.value)
  return isValid ? searchPreferences : []
}
