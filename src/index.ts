import path from 'path'
import type { ExtensionContext } from 'vscode'
import { commands, window, workspace } from 'vscode'
import DateFormat from 'licia/dateFormat'

import { createLauncher } from './launchers'

export async function activate(context: ExtensionContext) {
  const disposable = commands.registerCommand('uniapp-launcher.launch', async () => {
    const terminal = window.createTerminal(`${workspace.name}`)
    terminal.show()
    terminal.sendText('npm run dev:app')

    console.log(`项目 ${workspace.name} 开始编译...`)

    const launcher = await createLauncher('android', {
      appPath: path.resolve(__dirname, './apps/android_base.apk'),
      rootPath: workspace.workspaceFolders[0].uri.fsPath,
      log: (message: string) => {
        console.log(`[uniapp-launcher] ${DateFormat('HH:MM:ss.l')} ${message}`)
        // terminal.sendText(`[uniapp-launcher] ${DateFormat('HH:MM:ss.l')} ${message}`)
      }
    })
    await launcher.init()
    await launcher.start()
  })
  context.subscriptions.push(disposable)
}

// export function deactivate() {
//   console.log('deactivate')
// }
