import type { Platform, LauncherOptions } from '../types'
import AndroidLauncher from './AndroidLauncher'
import { debugLog } from '../utils'

export const createLauncher = async (platform: Platform, options: LauncherOptions) => {
  try {
    // const launcher = platform === 'ios' ? new IosLauncher(options) : new AndroidLauncher(options)
    const launcher = new AndroidLauncher(options)
    await launcher.init()
    await launcher.start()
    return launcher
  } catch (error) {
    debugLog(`createLauncher error: ${error}`)
  }
}
