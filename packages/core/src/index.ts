// import path from 'path'

import AndroidLauncher from './launchers/AndroidLauncher'
import IosLauncher from './launchers/IosLauncher'

import type { Platform, LauncherOptions } from './types'

// 创建启动器
export const createLauncher = async (platform: Platform, options: LauncherOptions) => {
  const launcher = platform === 'ios' ? new IosLauncher(options) : new AndroidLauncher(options)
  await launcher.init()
  await launcher.validate()
  await launcher.start()
  return launcher
}

// createLauncher('android', {
//   app: path.join(__dirname, '/apps/android_base.apk')
// })
