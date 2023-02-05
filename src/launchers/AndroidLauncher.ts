import Adb, { Client, DeviceClient } from '@devicefarmer/adbkit'

import BaseLauncher from './BaseLauncher'
import { ReadStream } from 'fs'

import { debugLog } from '../utils'

export default class AndroidLauncher extends BaseLauncher {
  client!: Client
  device!: DeviceClient
  storage!: string

  get DIR_WWW() {
    return `/storage/emulated/0/Android/data/${this._package}/apps/${this._appid}/www`
  }

  get COMMAND_EXTERNAL() {
    return 'echo $EXTERNAL_STORAGE'
  }

  get COMMAND_VERSION() {
    return `dumpsys package ${this._package}`
  }

  get COMMAND_STOP() {
    return `am force-stop ${this._package}`
  }
  get COMMAND_START() {
    return `am start -n ${this._package}/io.dcloud.PandoraEntry --es ${this._appid} --ez needUpdateApp false --ez reload true`
  }

  async init() {
    try {
      debugLog(`init starting...`)
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
      debugLog(`init succeeded: ${this._id} ${this.storage}`)
    } catch (error) {
      debugLog(`init failed, error: ${error}`)
    }
  }

  async shell(command: string) {
    debugLog(`SEND ► ${command}`)
    const stream = await this.device.shell(command)
    const result = (await Adb.util.readAll(stream)).toString()
    debugLog(`◀ RECV ${result}`)
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
    debugLog(`app installing...`)
    return this.device.install(this._app)
  }

  async start() {
    await this.exit()
    return await this.shell(this.COMMAND_START)
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

  push(contents: string | ReadStream, path: string) {
    return this.device.push(contents, path)
  }
}
