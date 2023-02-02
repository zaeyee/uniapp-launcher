import Debug from 'debug'
import DateFormat from 'licia/dateFormat'

import { readdir as _readdir, stat as _stat, existsSync } from 'fs'
import { resolve, join, relative } from 'path'
import { promisify } from 'util'

const DebugLog = Debug('automator:launcher')

const readdir = promisify(_readdir)
const stat = promisify(_stat)
const isWindows = /^win/.test(process.platform)

const pusher = async path => {
  const filenames = await readdir(path)
  return (
    await Promise.all(
      filenames.map(async filename => {
        const filepath = resolve(path, filename)
        const isDir = (await stat(filepath)).isDirectory()
        return isDir ? pusher(filepath) : filepath
      })
    )
  ).reduce((t, e) => t.concat(e), [])
}

export default class BaseLauncher {
  constructor(options) {
    this.id = options.id
    this.app = options.app
    this.appid = options.appid || 'HBuilder'
    this.package = options.package || 'io.dcloud.HBuilder'
  }

  get FILE_APP_SERVICE() {
    return `${this.DIR_WWW}/app-service.js`
  }

  shouldPush() {
    return this.exists(this.FILE_APP_SERVICE)
      .then(() => (DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} ${this.FILE_APP_SERVICE} exists`), false))
      .catch(() => (DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} ${this.FILE_APP_SERVICE} not exists`), true))
  }

  async push(t) {
    const e = await pusher(t)
    const s = e.map(e_1 => {
      const s_1 = (t_2 => (isWindows ? t_2.replace(/\\/g, '/') : t_2))(join(this.DIR_WWW, relative(t, e_1)))
      return DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} push ${e_1} ${s_1}`), this.pushFile(e_1, s_1)
    })
    await Promise.all(s)
    return true
  }

  async validate() {
    const version = await this.version()
    if (version) {
      return true
    }
    if (!this.app) {
      throw Error(`app-plus app is not provided`)
    } else if (!existsSync(this.app)) {
      throw Error(`${this.app} not exists`)
    }
    return this.install()
  }
}
