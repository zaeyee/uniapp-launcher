export const safeRequire = (name: string) => {
  try {
    return require(name)
  } catch (e) {
    return require(require.resolve(name, { paths: [process.cwd()] }))
  }
}

export const addZero = (number: number | string) => {
  number = +number
  return number > 9 ? String(number) : '0' + number
}
