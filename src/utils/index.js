module.exports = {
  safeObj: t => {
    return t && typeof t == 'object' && 'default' in t ? t : { default: t }
  },

  safeRequire: name => {
    try {
      return require(name)
    } catch (e) {
      return require(require.resolve(name, { paths: [process.cwd()] }))
    }
  },

  addZero: number => {
    number = +number
    return number > 9 ? String(number) : '0' + number
  }
}
