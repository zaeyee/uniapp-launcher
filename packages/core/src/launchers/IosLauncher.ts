import Debug from 'debug'
import Simctl from 'node-simctl'
import DateFormat from 'licia/dateFormat'
import { existsSync, copySync } from 'fs-extra'

import BaseLauncher from './BaseLauncher'
import { addZero } from '../utils'

const DebugLog = Debug('automator:simctl')

export default class IosLauncher extends BaseLauncher {
  bundleVersion!: string
  storage!: string
  tool!: string

  get DIR_WWW() {
    return `${this.storage}/Documents/Pandora/apps/${this._appid}/www/`
  }

  async init() {
    this.tool = new Simctl({ udid: this._id })
    try {
      await this.tool.bootDevice()
    } catch (error) {
      console.log('bootDevice error: ' + error)
    }
    await this.initSDCard(), DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} init ${this._id}`)
  }

  async initSDCard() {
    const t = await this.tool.appInfo(this._package)
    DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} appInfo ${t}`)
    const e = t.match(/DataContainer\s+=\s+"(.*)"/)
    if (!e) return Promise.resolve('')
    const s = t.match(/CFBundleVersion\s+=\s+(.*);/)
    if (!s) return Promise.resolve('')
    ;(this.storage = e[1].replace('file:', '')),
      (this.bundleVersion = s[1]),
      DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} install ${this.storage}`)
  }

  async version() {
    return Promise.resolve(this.bundleVersion)
  }

  formatVersion(t: string) {
    const e = t.split('.')
    return 3 !== e.length ? t : e[0] + addZero(e[1]) + addZero(e[2])
  }

  async install() {
    return (
      DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} install ${this._app}`),
      await this.tool.installApp(this._app),
      await this.tool.grantPermission(this._package, 'all'),
      await this.initSDCard(),
      Promise.resolve(true)
    )
  }

  async start() {
    try {
      await this.tool.terminateApp(this._package)
    } catch (error) {
      console.log('terminateApp error: ' + error)
    }
    try {
      await this.tool.launchApp(this._package)
    } catch (error) {
      console.error('launchApp error: ' + error)
    }
    return Promise.resolve(true)
  }

  async exit() {
    return await this.tool.terminateApp(this._package), await this.tool.shutdownDevice(), Promise.resolve(true)
  }

  async captureScreenshot() {
    return Promise.resolve(await this.tool.getScreenshot())
  }

  exists(t: string) {
    return existsSync(t) ? Promise.resolve(true) : Promise.reject(Error(`${t} not exists`))
  }

  pushFile(filepath: string, targetPath: string) {
    return Promise.resolve(copySync(filepath, targetPath))
  }
}
