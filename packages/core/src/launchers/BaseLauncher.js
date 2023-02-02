const Debug = require('debug')
const DateFormat = require('licia/dateFormat')

const Fs = require('fs')
const Path = require('path')
const Util = require('util')

const DebugLog = Debug('automator:launcher')

const readdir = Util.promisify(Fs.readdir)
const stat = Util.promisify(Fs.stat)
const isWindows = /^win/.test(process.platform)

const pusher = async path => {
  const filenames = await readdir(path)
  return (
    await Promise.all(
      filenames.map(async filename => {
        const filepath = Path.resolve(path, filename)
        const isDir = (await stat(filepath)).isDirectory()
        return isDir ? pusher(filepath) : filepath
      })
    )
  ).reduce((t, e) => t.concat(e), [])
}

module.exports = class BaseLauncher {
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
      const s_1 = (t_2 => (isWindows ? t_2.replace(/\\/g, '/') : t_2))(Path.join(this.DIR_WWW, Path.relative(t, e_1)))
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
    } else if (!Fs.existsSync(this.app)) {
      throw Error(`${this.app} not exists`)
    }
    return this.install()
  }
}
