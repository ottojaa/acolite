import * as path from 'path'
export const getDirName = (filePath: string) => path.dirname(filePath)
export const getExtension = (filePath: string) => path.extname(filePath)
export const getBaseName = (filePath: string) => path.basename(filePath)
export const getJoinedPath = (paths: string[]) => path.join(...paths)
export const getPathSeparator = () => path.sep
