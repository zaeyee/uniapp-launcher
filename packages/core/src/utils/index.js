module.exports = {
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
