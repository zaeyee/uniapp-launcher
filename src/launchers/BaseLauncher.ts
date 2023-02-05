import fs from 'fs/promises'
import { join, relative } from 'path'

import { LauncherOptions } from '../types'
import { debugLog, getFilepaths } from '../utils'

interface Launcher {
  get DIR_WWW(): string
  version(): Promise<string>
  install(): Promise<boolean>
  exists(path: string): unknown
  push(path: string, targetPath: string): unknown
}

export default abstract class BaseLauncher implements Launcher {
  protected _id: string
  protected _app: string
  protected _appid: string
  protected _package: string
  protected _filesDir: string

  constructor(options: LauncherOptions) {
    this._id = options.id || ''
    this._app = options.app || ''
    this._appid = options.appid || 'HBuilder'
    this._package = options.package || 'io.dcloud.HBuilder'
    this._filesDir = options.filesDir || 'dist/dev/app/**'
  }

  get DIR_WWW(): string {
    throw new Error('Method not implemented.')
  }

  get FILE_APP_SERVICE() {
    return `${this.DIR_WWW}/app-service.js`
  }

  version(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  install(): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  exists(path: string): unknown {
    throw new Error('Method not implemented.')
  }

  push(path: string, targetPath: string): unknown {
    throw new Error('Method not implemented.')
  }

  async initApp(): Promise<void> {
    debugLog(`init app starting...`)
    const version = await this.version()
    if (version) return
    if (!this._app) {
      throw Error(`app-plus app is not provided`)
    } else if (!fs.stat(this._app)) {
      throw Error(`${this._app} not exists`)
    }
    await this.install()
  }

  async initFiles() {
    debugLog(`init app files...`)
    if (await this.exists(this.FILE_APP_SERVICE)) {
      debugLog(`${this.FILE_APP_SERVICE} exists`)
      return
    }
    debugLog(`${this.FILE_APP_SERVICE} not exists`)
    const filepaths = await getFilepaths(this._filesDir)
    filepaths.forEach((filepath: string) => {
      const targetPath = join(this.DIR_WWW, relative(this._filesDir, filepath))
      debugLog(`push ${filepath} ${targetPath}`)
      this.push(filepath, targetPath)
    })
    // await Promise.all(filepaths)
    return true
  }
}
