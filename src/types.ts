export type Platform = 'android' | 'ios'

export interface LauncherOptions {
  id?: string
  appid?: string
  appPath?: string
  appPackage?: string
  rootPath?: string
  filesPath?: string
  log?: (message: string) => void
}
