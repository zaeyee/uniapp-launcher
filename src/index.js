const { safeObj } = require('./utils')

const Fs = safeObj(require('fs'))
const Debug = safeObj(require('debug'))
// const PostCssSelectorParser = safeObj(require('postcss-selector-parser'))
const Sleep = safeObj(require('licia/sleep'))

const AndroidLauncher = require('./launchers/AndroidLauncher')
const IosLauncher = require('./launchers/IosLauncher')

const DebugDevtoolLog = Debug.default('automator:devtool')

let launcher,
  successful = false
const versionReg = { android: /android_version=(.*)/, ios: /iphone_version=(.*)/ }

// const adapterKeys = ['Page.getElement', 'Page.getElements', 'Element.getElement', 'Element.getElements']
const adapter = {
  'Tool.close': { reflect: async () => {} },
  'App.exit': { reflect: async () => launcher.exit() },
  'App.enableLog': { reflect: () => Promise.resolve() },
  'App.captureScreenshot': {
    reflect: async (t, e) => {
      const data = await launcher.captureScreenshot(e)
      return DebugDevtoolLog(`App.captureScreenshot ${data.length}`), { data }
    }
  }
}

// const getAdapterItem = function (t) {
//   return {
//     reflect: async (e, s) => e(t, s, false),
//     params: options => {
//       if (options.selector) {
//         options.selector = PostCssSelectorParser.default(t => {
//           t.walk(t => {
//             if ('tag' === t.type) {
//               const e = t.value
//               t.value = 'page' === e ? 'body' : 'uni-' + e
//             }
//           })
//         }).processSync(options.selector)
//       }
//       return options
//     }
//   }
// }

// !(function (adapterItem) {
//   adapterKeys.forEach(key => {
//     adapterItem[key] = getAdapterItem(key)
//   })
// })(adapter)

const getVersion = (version, platform) => {
  if (!version.endsWith('.txt')) {
    return version
  }
  try {
    const result = Fs.default.readFileSync(version).toString().match(versionReg[platform])
    if (result) return result[1]
  } catch (error) {
    console.error(error)
  }
}

const Automator = {
  devtools: {
    name: 'App',
    paths: [],
    required: ['manifest.json', 'app-service.js'],
    validate: async (options, e) => {
      options.platform = (options.platform || process.env.UNI_OS_NAME).toLocaleLowerCase()
      // Object.assign(options, options[options.platform])
      const launcher = options.platform === 'ios' ? new IosLauncher(options) : new AndroidLauncher(options)
      await launcher.init()
      const version = await launcher.version()
      if (version) {
        if (options.version) {
          const newVersion = launcher.formatVersion(getVersion(options.version, options.platform))
          DebugDevtoolLog(`version: ${version}`)
          DebugDevtoolLog(`newVersion: ${newVersion}`)
          if (newVersion !== version) {
            successful = true
          }
        }
      } else {
        successful = true
      }

      if (successful) {
        if (!options.executablePath) {
          throw Error(`app-plus->${options.platform}->executablePath is not provided`)
        }
        if (!Fs.default.existsSync(options.executablePath)) {
          throw Error(`${options.executablePath} not exists`)
        }
      }
      return options
    },
    create: async (arg1, arg2, arg3) => {
      if (successful) {
        await launcher.install()
      }
      if (successful || arg3.compiled || (await launcher.shouldPush())) {
        await launcher.push(arg1)
        await Sleep.default(1000)
      }
      await launcher.start()
    }
  },
  adapter
}

Automator.devtools.validate({
  platform: 'android',
  id: '',
  executablePath: ''
})

module.exports = Automator
