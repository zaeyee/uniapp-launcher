import path from 'path'
import type { ExtensionContext } from 'vscode'
import { commands, window } from 'vscode'

import AndroidLauncher from './launchers/AndroidLauncher'

import type { Platform, LauncherOptions } from './types'

import { debugLog } from './utils'

// 创建启动器
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

export async function activate(context: ExtensionContext) {
  debugLog('Congratulations, your extension "uniapp-launcher" is now active!')

  const disposable = commands.registerCommand('uniapp-launcher.launch', () => {
    window.showInformationMessage('Hello World uniapp-launcher!')
  })

  context.subscriptions.push(disposable)

  await createLauncher('android', {
    app: path.resolve(__dirname, './apps/android_base.apk')
  })
}

export function deactivate() {
  debugLog('deactivate')
}
