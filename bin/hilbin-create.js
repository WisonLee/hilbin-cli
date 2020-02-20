'use strict'
const program = require('commander')
const chalk = require('chalk')
const fs = require('fs-extra')
const ora = require('ora')
const path = require('path')
const os = require('os')
const spinner = new ora()

let fileName
program
  .usage('<file-name>')
  .option('-s, --saga', '创建saga文件')
  .option('-a, --actions', '创建action文件')
  .option('-c, --constant', '创建constant文件')
  .option('-m, --container', '创建container文件')
  .parse(process.argv)

fileName = program.args[0]
if (fileName === undefined) {
  console.log(chalk.red('请输入文件名'))
  program.help()
  process.exit(1)
}
const fileNameUpperCase = `${fileName.substring(0,1).toUpperCase() + fileName.substring(1)}`
let fileTemp = {
  'saga': require('../lib/file-template/saga'),
  'constant': require('../lib/file-template/constant'),
  'action': require('../lib/file-template/action'),
  'container': require('../lib/file-template/container')
}
if (program.saga) {
  createFileBySaga()
} else if (program.actions) {
  createFileByAction()
} else if (program.constant) {
  createFileByConstant()
} else if (program.container) {
  createFileByContainer()
} else {
  createFileByAction()
  createFileByConstant()
  createFileBySaga()
  createFileByContainer()
}
function createFileByContainer () {
  let temp = fileTemp['container']
  let filePath = `${process.cwd()}/frontend/containers/buss`
  let dirPath = `${filePath}/${fileNameUpperCase}`
  createDir(dirPath)
  createFile(temp, dirPath, 'default')
  setContainerToRoute()
  console.log(`${chalk.green('创建container文件成功')}`)
}
function createFileByAction () {
  let temp = fileTemp['action']
  let filePath = `${process.cwd()}/frontend/actions/buss`
  createFile(temp, filePath, `${fileName}Action`)
  console.log(`${chalk.green('创建action文件成功')}`)
}
function createFileByConstant () {
  let temp = fileTemp['constant']
  let filePath = `${process.cwd()}/frontend/constants/modules/buss`
  createFile(temp, filePath, `${fileName}Constant`)
  console.log(`${chalk.green('创建constants文件成功')}`)
}
function createFileBySaga () {
  let temp = fileTemp['saga']
  let filePath = `${process.cwd()}/frontend/sagas/buss`
  let fileNameBySaga = `${fileName}Saga`
  createFile(temp, filePath, fileNameBySaga)
  setSagaToSagas(fileNameBySaga)
  console.log(`${chalk.green('创建saga文件成功')}`)
}

function setContainerToRoute () {
  let bussModulesPath = `${process.cwd()}/frontend/app-routes/bussModules.jsx`
  let data = fs.readFileSync(bussModulesPath, 'utf-8')
  if (data.indexOf('/*router*/') === -1) {
    console.log(`========================================`)
    console.log()
    console.log(`未能找到${chalk.yellow('/*router*/')}标识`)
    console.log('请添加上/*router*/标识，例如：')
    console.log()
    console.log(`const routesMainProject = {
      Hello${chalk.yellow('/*router*/')}
    }`)
    process.exit(1)
    return
  }
  if (data.indexOf(fileNameUpperCase) !== -1) {
    return
  }
  const webpackDevPath = path.join(process.cwd(), 'webpack.dev.js')
  let devJson = require(webpackDevPath)
  let port = devJson['devServer'].port
  let loadable = `${fileNameUpperCase}: Loadable({
    loader: () =>
      import(/* webpackChunkName: '${fileNameUpperCase}' */ 'containers/buss/${fileNameUpperCase}/default')
  })/*router*/`
  data = data.replace(/(\/\*router\*\/)|(\)\/\*router\*\/)/g, world => {
    if (world.indexOf(')/*router*/') !== -1){
      console.log(`),${os.EOL}  ${loadable}`)
      return `),${os.EOL}  ${loadable}`
    } else {
      return loadable
    }
  })
  fs.writeFileSync(bussModulesPath, data, error => {
    if (error) {
      console.log(error)
      process.exit(1)
    }
  })
  // spinner.succeed(`创建业务成功，可通过 http://localhost:${port}/#/${fileNameUpperCase} 访问`)
}

function setSagaToSagas (fileNameBySaga) {
  let sagaPath = `${process.cwd()}/frontend/sagas/buss/default.js`
  let data = fs.readFileSync(sagaPath, 'utf-8')
  if (data.indexOf('/*saga*/') === -1 || data.indexOf('/*sagaFn*/') === -1 ) {
    console.log(`========================================`)
    console.log()
    console.log(`未能找到${chalk.yellow('/*saga*/')}或${chalk.yellow('/*sagaFn*/')}标识`)
    console.log('请添加上/*saga*/|/*sagaFn*/标识，例如：')
    console.log()
    console.log(`/*saga*/
    export default [
      /*sagaFn*/
    ]`)
    process.exit(1)
    return
  }
  if (data.indexOf(fileNameBySaga) !== -1) {
    return
  }
  let saga = `import ${fileNameBySaga} from './${fileNameBySaga}'${os.EOL}/*saga*/`
  let sagaFn = `${fileNameBySaga}()/*sagaFn*/`
  data = data.replace(/(\/\*saga\*\/)|(\/\*sagaFn\*\/)|(\)\/\*sagaFn\*\/)/g, world => {
    console.log(world)
    if (world.indexOf('/*saga*/') !== -1) {
      return saga
    } else if (world.indexOf(')/*sagaFn*/') !== -1) {
      return `),${os.EOL}  ${sagaFn}`
    } else if (world.indexOf('/*sagaFn*/') !== -1) {
      return sagaFn
    }
  })
  fs.writeFileSync(sagaPath, data, error => {
    if (error) {
      console.log(error)
      process.exit(1)
    }
  })
}

function createDir (file) {
  fs.mkdirSync(file, { recursive: true }, error => {
    if (error) throw error
  })
}
function createFile (temp, filePath, fileName) {
  let file = `${filePath}/${fileName}.js`
  let data = temp.replace(/%(\w+)%/g, replaceName)
  fs.writeFileSync(file, data, error => {
    if (error) {
      console.log(error)
      process.exit(1)
    }
  })
}

function replaceName (world) {
  if (world.indexOf('action') !== -1) {
    return `${fileName}Action`
  } else if (world.indexOf('constant') !== -1) {
    return `${fileName}Constant`
  }
  return `${fileName}Saga`
}