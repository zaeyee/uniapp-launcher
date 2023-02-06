import type { Platform, LauncherOptions } from '../types'
import AndroidLauncher from './AndroidLauncher'

export const createLauncher = async (platform: Platform, options: LauncherOptions) => {
  // const launcher = platform === 'ios' ? new IosLauncher(options) : new AndroidLauncher(options)
  return new AndroidLauncher(options)
}
