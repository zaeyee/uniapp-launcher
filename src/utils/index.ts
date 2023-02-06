import { workspace } from 'vscode'

export const addZero = (number: number | string) => {
  number = +number
  return number > 9 ? String(number) : '0' + number
}

export const getFilepaths = async (dirPath: string) => {
  const fileUris = await workspace.findFiles(dirPath + '/**')
  return fileUris.map(fileUri => workspace.asRelativePath(fileUri, false))
}
