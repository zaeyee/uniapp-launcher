import { join, relative } from 'path'

import { LauncherOptions } from '../types'
import { getFilepaths } from '../utils'

interface Launcher {
  get DIR_WWW(): string
  version(): Promise<string>
  install(): Promise<boolean>
  exists(path: string): unknown
  push(path: string, targetPath: string): unknown
}

export default abstract class BaseLauncher implements Launcher {
  protected _id: string
  protected _appid: string
  protected _appPath: string
  protected _appPackage: string
  protected _rootPath: string
  protected _filesPath: string
  protected _log: (message: string) => void

  constructor(options: LauncherOptions) {
    this._id = options.id || ''
    this._appid = options.appid || 'HBuilder'
    this._appPath = options.appPath || ''
    this._appPackage = options.appPackage || 'io.dcloud.HBuilder'
    this._rootPath = options.rootPath || ''
    this._filesPath = options.filesPath || 'dist/dev/app'
    this._log = options.log
  }

  get id() {
    return this._id
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
    const version = await this.version()
    if (version) {
      // TODO: 判断是否需要更新基座
      this._log(`手机端调试基座版本号为${version}，版本号相同，跳过基座更新`)
      return
    }
    if (!this._appPath) {
      throw Error(`app-plus app is not provided`)
    }
    await this.install()
  }

  /**
   * 同步编译后的文件到手机端基座
   * @returns
   */
  async initFiles() {
    this._log(`正在同步手机端程序文件...`)
    if (!(await this.exists(this.FILE_APP_SERVICE))) {
      const filepaths = await getFilepaths(this._filesPath)
      filepaths.forEach(async (filepath: string) => {
        const targetPath = join(this.DIR_WWW, relative(this._filesPath, filepath))
        filepath = join(this._rootPath, filepath)
        // this._log(`push ${filepath} ${targetPath}`)
        await this.push(filepath, targetPath)
      })
    }
    this._log(`同步手机端程序文件完成`)
  }
}
