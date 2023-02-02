const { safeObj } = require('../utils')

const Debug = safeObj(require('debug'))
const DateFormat = safeObj(require('licia/dateFormat'))

const AdbKit = require('adbkit')
const DebugLog = Debug.default('automator:adb')

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

  shell(command) {
    DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} SEND ► ${command}`)
    return this.client
      .shell(this.id, command)
      .then(AdbKit.util.readAll)
      .then(result => {
        const resultStr = result.toString()
        DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} ◀ RECV ${resultStr}`)
        return resultStr
      })
  }

  async init() {
    try {
      this.client = AdbKit.createClient()
      console.log(this.client)
      if (this.client && !this.id) {
        const devices = await this.client.listDevices()
        console.log(devices)
        if (!devices.length) throw Error('Device not found')
        this.id = devices[0].id
      }
      // this.sdcard = (await this.shell(this.COMMAND_EXTERNAL)).trim()
    } catch (error) {
      console.log(error)
    }

    DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} init ${this.id} ${this.sdcard}`)
  }

  version() {
    return this.shell(this.COMMAND_VERSION).then(result => {
      const matchResult = result.match(/versionName=(.*)/)
      return matchResult && matchResult.length > 1 ? matchResult[1] : ''
    })
  }

  formatVersion(version) {
    return version
  }

  async install() {
    let permission = true
    try {
      const e = (await this.client.getProperties(this.id))['ro.build.version.release'].split('.')[0]
      if (parseInt(e) < 6) {
        permission = false
      }
    } catch (error) {
      console.log('install error: ' + error)
    }

    DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} install ${this.app} permission=${permission}`)
    if (permission) {
      const adbCommand = require('adbkit/lib/adb/command.js'),
        originSend = adbCommand.prototype._send
      adbCommand.prototype._send = function (command) {
        if (command.indexOf('shell:pm install -r ') === 0) {
          command = command.replace('shell:pm install -r ', 'shell:pm install -r -g ')
        }
        DebugLog(`${DateFormat.default('yyyy-mm-dd HH:MM:ss:l')} ${command} `)
        return originSend.call(this, command)
      }
    }
    return this.client.install(this.id, this.app).then(() => this.init())
  }

  start() {
    return this.exit().then(() => this.shell(this.COMMAND_START))
  }

  exit() {
    return this.shell(this.COMMAND_STOP)
  }

  captureScreenshot() {
    return this.client.screencap(this.id).then(
      t =>
        new Promise(e => {
          const s = []
          t.on('data', function (t) {
            s.push(t)
          }),
            t.on('end', function () {
              e(Buffer.concat(s).toString('base64'))
            })
        })
    )
  }

  exists(t) {
    return this.client.stat(this.id, t)
  }

  pushFile(t, e) {
    return this.client.push(this.id, t, e)
  }
}
