import path from 'path'
import type { ExtensionContext } from 'vscode'
import { commands, window, workspace } from 'vscode'

import { createLauncher } from './launchers'
import { debugLog } from './utils'

export async function activate(context: ExtensionContext) {
  debugLog('Congratulations, your extension "uniapp-launcher" is now active!')

  const disposable = commands.registerCommand('uniapp-launcher.launch', async () => {
    window.showInformationMessage('Hello World uniapp-launcher!')

    await createLauncher('android', {
      appPath: path.resolve(__dirname, './apps/android_base.apk'),
      rootPath: workspace.workspaceFolders[0].uri.fsPath
    })
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {
  debugLog('deactivate')
}
