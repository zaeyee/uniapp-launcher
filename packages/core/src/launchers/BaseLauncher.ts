import Debug from 'debug'
import DateFormat from 'licia/dateFormat'

import { existsSync } from 'fs'
// import { readdir as _readdir, stat as _stat, existsSync } from 'fs'
// import { resolve, join, relative } from 'path'
// import { promisify } from 'util'

import { LauncherOptions } from '../types'

const DebugLog = Debug('automator:launcher')

// const readdir = promisify(_readdir)
// const stat = promisify(_stat)
// const isWindows = /^win/.test(process.platform)

// const pusher = async (path: string) => {
//   const filenames = await readdir(path)
//   return (
//     await Promise.all(
//       filenames.map(async filename => {
//         const filepath = resolve(path, filename)
//         const isDir = (await stat(filepath)).isDirectory()
//         return isDir ? pusher(filepath) : filepath
//       })
//     )
//   ).reduce((t, e) => t.concat(e), [])
// }

interface Launcher {
  get DIR_WWW(): string
  version(): Promise<string>
  install(): void
  exists(path: string): Promise<boolean>
  pushFile(path: string, targetPath: string): Promise<boolean>
}

export default abstract class BaseLauncher implements Launcher {
  protected _id: string
  protected _app: string
  protected _appid: string
  protected _package: string

  constructor(options: LauncherOptions) {
    this._id = options.id || ''
    this._app = options.app || ''
    this._appid = options.appid || 'HBuilder'
    this._package = options.package || 'io.dcloud.HBuilder'
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

  install(): void {
    throw new Error('Method not implemented.')
  }

  exists(path: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  pushFile(path: string, targetPath: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  async shouldPush() {
    try {
      await this.exists(this.FILE_APP_SERVICE)
      DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} ${this.FILE_APP_SERVICE} exists`)
      return false
    } catch {
      DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} ${this.FILE_APP_SERVICE} not exists`)
      return true
    }
  }

  // async push(t: string) {
  //   const e = await pusher(t)
  //   const s = e.map((e_1: string) => {
  //     const s_1 = (t_2 => (isWindows ? t_2.replace(/\\/g, '/') : t_2))(join(this.DIR_WWW, relative(t, e_1)))
  //     return DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} push ${e_1} ${s_1}`), this.pushFile(e_1, s_1)
  //   })
  //   await Promise.all(s)
  //   return true
  // }

  async validate() {
    const version = await this.version()
    if (version) {
      return true
    }
    if (!this._app) {
      throw Error(`app-plus app is not provided`)
    } else if (!existsSync(this._app)) {
      throw Error(`${this._app} not exists`)
    }
    return this.install()
  }
}
