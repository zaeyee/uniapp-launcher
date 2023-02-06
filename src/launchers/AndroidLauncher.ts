import Adb, { Client, DeviceClient } from '@devicefarmer/adbkit'

import BaseLauncher from './BaseLauncher'

export default class AndroidLauncher extends BaseLauncher {
  client!: Client
  device!: DeviceClient
  storage!: string

  get DIR_WWW() {
    return `/storage/emulated/0/Android/data/${this._appPackage}/apps/${this._appid}/www`
  }

  get COMMAND_EXTERNAL() {
    return 'echo $EXTERNAL_STORAGE'
  }

  get COMMAND_VERSION() {
    return `dumpsys package ${this._appPackage}`
  }

  get COMMAND_STOP() {
    return `am force-stop ${this._appPackage}`
  }
  get COMMAND_START() {
    return `am start -n ${this._appPackage}/io.dcloud.PandoraEntry --es ${this._appid} --ez needUpdateApp false --ez reload true`
  }

  async init() {
    try {
      this._log(`正在建立手机连接...`)
      this.client = Adb.createClient()
      if (this.client && !this._id) {
        const devices = await this.client.listDevices()
        if (!devices.length) throw Error('Device not found')
        this._id = devices[0].id
        this.device = this.client.getDevice(this._id)
      }
      this.storage = (await this.shell(this.COMMAND_EXTERNAL)).trim()
      await this.initApp()
      await this.initFiles()
    } catch (error) {
      this._log(`手机连接失败：${error}`)
    }
  }

  async shell(command: string) {
    // this._log(`SEND ► ${command}`)
    const stream = await this.device.shell(command)
    const result = (await Adb.util.readAll(stream)).toString()
    // this._log(`◀ RECV ${result}`)
    return result
  }

  async version(): Promise<string> {
    const result = await this.shell(this.COMMAND_VERSION)
    const matchResult = result.match(/versionName=(.*)/)
    return matchResult && matchResult.length > 1 ? matchResult[1] : ''
  }

  formatVersion(version: string) {
    return version
  }

  async install(): Promise<boolean> {
    this._log(`正在安装手机端${this._id}调试基座...`)
    return this.device.install(this._appPath)
  }

  async start() {
    this._log(`正在启动${this._appid}调试基座...`)
    await this.exit()
    await this.shell(this.COMMAND_START)
    this._log(`应用${this._appid}已启动`)
  }

  exit() {
    return this.shell(this.COMMAND_STOP)
  }

  // async captureScreenshot() {
  //   const result = await this.device.screencap()
  //   return await new Promise(e => {
  //     const s: string[] | readonly Uint8Array[] = []
  //     result.on('data', function (t_1: unknown) {
  //       s.push(t_1)
  //     })
  //     result.on('end', function () {
  //       e(Buffer.concat(s).toString('base64'))
  //     })
  //   })
  // }

  async exists(path: string) {
    try {
      return await this.device.stat(path)
    } catch (error) {
      return false
    }
  }

  push(path: string, targetPath: string) {
    return this.device.push(path, targetPath)
  }
}
