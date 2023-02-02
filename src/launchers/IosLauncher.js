const { safeObj, safeRequire, addZero } = require('../utils')

const Debug = safeObj(require('debug'))
const DateFormat = safeObj(require('licia/dateFormat'))

const FsExtra = safeObj(require('fs-extra'))

const DebugLog = Debug.default('automator:simctl')

const BaseLauncher = require('./BaseLauncher')

module.exports = class IosLauncher extends BaseLauncher {
  constructor() {
    super(...arguments), (this.bundleVersion = '')
  }

  get DIR_WWW() {
    return `${this.sdcard}/Documents/Pandora/apps/${this.appid}/www/`
  }

  async init() {
    const t = safeRequire('node-simctl').Simctl
    this.tool = new t({ udid: this.id })
    try {
      await this.tool.bootDevice()
    } catch (error) {
      console.log('bootDevice error: ' + error)
    }
    await this.initSDCard(), DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} init ${this.id}`)
  }

  async initSDCard() {
    const t = await this.tool.appInfo(this.package)
    DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} appInfo ${t}`)
    const e = t.match(/DataContainer\s+=\s+"(.*)"/)
    if (!e) return Promise.resolve('')
    const s = t.match(/CFBundleVersion\s+=\s+(.*);/)
    if (!s) return Promise.resolve('')
    ;(this.sdcard = e[1].replace('file:', '')),
      (this.bundleVersion = s[1]),
      DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} install ${this.sdcard}`)
  }

  async version() {
    return Promise.resolve(this.bundleVersion)
  }

  formatVersion(t) {
    const e = t.split('.')
    return 3 !== e.length ? t : e[0] + addZero(e[1]) + addZero(e[2])
  }

  async install() {
    return (
      DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} install ${this.app}`),
      await this.tool.installApp(this.app),
      await this.tool.grantPermission(this.package, 'all'),
      await this.initSDCard(),
      Promise.resolve(true)
    )
  }

  async start() {
    try {
      await this.tool.terminateApp(this.package)
    } catch (error) {
      console.log('terminateApp error: ' + error)
    }
    try {
      await this.tool.launchApp(this.package)
    } catch (error) {
      console.error('launchApp error: ' + error)
    }
    return Promise.resolve(true)
  }

  async exit() {
    return await this.tool.terminateApp(this.package), await this.tool.shutdownDevice(), Promise.resolve(true)
  }

  async captureScreenshot() {
    return Promise.resolve(await this.tool.getScreenshot())
  }

  exists(t) {
    return FsExtra.default.existsSync(t) ? Promise.resolve(true) : Promise.reject(Error(`${t} not exists`))
  }

  pushFile(filepath, targetPath) {
    return Promise.resolve(FsExtra.default.copySync(filepath, targetPath))
  }
}
