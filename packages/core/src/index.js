const Path = require('path')

const AndroidLauncher = require('./launchers/AndroidLauncher')
const IosLauncher = require('./launchers/IosLauncher')

// 创建启动器
const createLauncher = async (platform, options) => {
  const launcher = platform === 'ios' ? new IosLauncher(options) : new AndroidLauncher(options)
  await launcher.init()
  await launcher.validate()
  await launcher.start()
  return launcher
}

createLauncher('android', {
  app: Path.join(__dirname, '/apps/android_base.apk')
})
