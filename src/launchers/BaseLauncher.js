const { safeObj } = require('../utils')

const Debug = safeObj(require('debug'))
const DateFormat = safeObj(require('licia/dateFormat'))

const Fs = safeObj(require('fs'))
const Path = require('path')
const Util = require('util')

const DebugLog = Debug.default('automator:launcher')

const readdir = Util.promisify(Fs.default.readdir)
const stat = Util.promisify(Fs.default.stat)
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
    this.app = options.executablePath
    this.appid = options.appid || 'HBuilder'
    this.package = options.package || 'io.dcloud.HBuilder'
  }

  get FILE_APP_SERVICE() {
    return `${this.DIR_WWW}/app-service.js`
  }

  shouldPush() {
    return this.exists(this.FILE_APP_SERVICE)
      .then(() => (DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} ${this.FILE_APP_SERVICE} exists`), false))
      .catch(
        () => (DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} ${this.FILE_APP_SERVICE} not exists`), true)
      )
  }

  async push(t) {
    const e = await pusher(t)
    const s = e.map(e_1 => {
      const s_1 = (t_2 => (isWindows ? t_2.replace(/\\/g, '/') : t_2))(Path.join(this.DIR_WWW, Path.relative(t, e_1)))
      return DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} push ${e_1} ${s_1}`), this.pushFile(e_1, s_1)
    })
    const t_3 = await Promise.all(s)
    return true
  }
}
