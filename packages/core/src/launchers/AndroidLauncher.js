// const Debug = require('debug').default
const DateFormat = require('licia/dateFormat')

const Adb = require('@devicefarmer/adbkit').default

// const DebugLog = Debug('automator:adb')
const DebugLog = console.log

const BaseLauncher = require('./BaseLauncher')

module.exports = class AndroidLauncher extends BaseLauncher {
  get DIR_WWW() {
    return `/storage/emulated/0/Android/data/${this.package}/apps/${this.appid}/www`
  }
  get COMMAND_EXTERNAL() {
    return 'echo $EXTERNAL_STORAGE'
  }
  get COMMAND_VERSION() {
    return `dumpsys package ${this.package}`
  }
  get COMMAND_STOP() {
    return `am force-stop ${this.package}`
  }
  get COMMAND_START() {
    return `am start -n ${this.package}/io.dcloud.PandoraEntry --es ${this.appid} --ez needUpdateApp false --ez reload true`
  }

  async init() {
    try {
      this.client = Adb.createClient()
      if (this.client && !this.id) {
        const devices = await this.client.listDevices()
        if (!devices.length) throw Error('Device not found')
        this.id = devices[0].id
        this.device = this.client.getDevice(this.id)
      }
      this.storage = (await this.shell(this.COMMAND_EXTERNAL)).trim()
      DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} init ${this.id} ${this.storage}`)
    } catch (error) {
      console.log(error)
    }
  }

  async shell(command) {
    DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} SEND ► ${command}`)
    const stream = await this.device.shell(command)
    const result = (await Adb.util.readAll(stream)).toString()
    DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} ◀ RECV ${result}`)
    return result
  }

  async version() {
    const result = await this.shell(this.COMMAND_VERSION)
    const matchResult = result.match(/versionName=(.*)/)
    return matchResult && matchResult.length > 1 ? matchResult[1] : ''
  }

  formatVersion(version) {
    return version
  }

  async install() {
    DebugLog(`${DateFormat('yyyy-mm-dd HH:MM:ss:l')} installing ${this.app}`)
    await this.device.install(this.app)
    return this.init()
  }

  async start() {
    await this.exit()
    return await this.shell(this.COMMAND_START)
  }

  exit() {
    return this.shell(this.COMMAND_STOP)
  }

  async captureScreenshot() {
    const result = await this.device.screencap()
    return await new Promise(e => {
      const s = []
      result.on('data', function (t_1) {
        s.push(t_1)
      })
      result.on('end', function () {
        e(Buffer.concat(s).toString('base64'))
      })
    })
  }

  exists(path) {
    return this.device.stat(path)
  }

  pushFile(contents, path) {
    return this.device.push(contents, path)
  }
}
