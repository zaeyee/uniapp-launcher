// const Debug = require('debug').default
import DateFormat from 'licia/dateFormat'

import Adb, { Client, DeviceClient } from '@devicefarmer/adbkit'

// const DebugLog = Debug('automator:adb')
const DebugLog = console.log

import BaseLauncher from './BaseLauncher'
import { ReadStream } from 'fs'

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
      this.client = Adb.createClient()
      if (this.client && !this._id) {
        const devices = await this.client.listDevices()
        if (!devices.length) throw Error('Device not found')
        this._id = devices[0].id
        this.device = this.client.getDevice(this._id)
      }
      this.storage = (await this.shell(this.COMMAND_EXTERNAL)).trim()
      DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} init ${this._id} ${this.storage}`)
    } catch (error) {
      console.log(error)
    }
  }

  async shell(command: string) {
    DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} SEND ► ${command}`)
    const stream = await this.device.shell(command)
    const result = (await Adb.util.readAll(stream)).toString()
    DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} ◀ RECV ${result}`)
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

  async install() {
    DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} installing ${this._app}`)
    await this.device.install(this._app)
    return this.init()
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

  exists(path: string) {
    return this.device.stat(path)
  }

  pushFile(contents: string | ReadStream, path: string) {
    return this.device.push(contents, path)
  }
}
