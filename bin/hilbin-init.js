'use strict'

const program = require('commander')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const fetch = require('isomorphic-fetch')
const download = require('download-git-repo')
// const packageJson = require('../package')
const os = require('os')
const spawn = require('cross-spawn')
const templateData = require('./mf-template-data')

console.log()
console.log(chalk.cyan('======初始化项目======'))
console.log()
const spinner = ora()
program.usage('<project-name>').parse(process.argv)
let projectName = program.args[0]
let root
let appName
if (projectName === undefined) {
  spinner.stop()
  inquirer.prompt({
    type: 'input',
    message: '请输入目录名称：',
    name: 'projectName',
    validate: function(name) {
      if (checkProjectName(name)) {
        return true
      }
      return `请正确输入名称，格式以字母开头，例如：${chalk.green('my-project')}`
    }
  }).then(answer => {
    projectName = answer['projectName']
    createProject()
  })
} else {
  let canUse = checkProjectName(projectName)
  if (canUse) {
    createProject()
  } else {
    spinner.fail(`请正确输入名称，格式以字母开头，例如：${chalk.green('my-project')}`)
    process.exit(1);
  }
}
async function createProject () {
  await createProjectDir()

  await downloadTemplate()

  await setProjectNameByPackage()

  await install()

  // await runDev()
}
//检测项目名称
function checkProjectName (name) {
  return /^[a-zA-Z]+/g.test(name)
}
// 创建目录
function createProjectDir () {
  return new Promise (resolve => {
    root = path.resolve(projectName)
    appName = path.basename(root)

    fs.ensureDirSync(projectName)
    process.chdir(root)
    resolve()
  })
}

// 下载模板
function downloadTemplate () {
  return new Promise ((resolve, reject) => {
    inquirer.prompt([
      {
        type: 'list',
        message: `请选择${chalk.red('微前端')}工程模板：`,
        name: 'item',
        choices: templateData['data'],
      },
      {
        type: 'list',
        message: `请选择网络环境：`,
        name: 'path',
        choices: function (answer) {
          return answer['item']['url']
        },
      },
      {
        type: 'input',
        message: '请输入packageName：',
        name: 'packageName',
        default: projectName,
        when: function (answer) {
          return answer['item'].id === 'sub'
        }
      }
    ]).then((answer) => {
      console.log()
      let url = answer.path
      console.log()
      console.log(`${chalk.yellow(`正在下载模板 ${url}...`)}`)
      console.log()
      download(url, root, {clone: true},function (error) {
        if (error) {
          console.log()
          reject(error)
          // console.log(error)
          spinner.fail(`${chalk.red('模板下载失败')}`)
        } else {
          console.log()
          resolve()
          if (answer['packageName']) {
            setPackageNameBySub(answer['packageName'])
          } else {
            spinner.succeed(`${chalk.green('模板下载完成')}`)
          }
        }
      })
    })
  })
}

// 设置子应用webapck.common的packageName
function setPackageNameBySub (name) {
  return new Promise(resolve => {
    const filePath = path.join(process.cwd(), 'webpack.common.js')
    let data = fs.readFileSync(filePath, 'utf-8')
    data = data.replace(/const packageName = 'mf'/g, `const packageName = '${name}'`)
    fs.writeFileSync(filePath, data, error => {
      if (error) {
        console.log(error)
        process.exit(1)
      }
    })
    spinner.succeed(`${chalk.green('模板下载完成')}`)
    resolve()
  })
}

// 设置package的name为projectName
function setProjectNameByPackage () {
  return new Promise ((resolve) => {
    const packagePath = path.join(process.cwd(), 'package.json')
    let packageJson = require(packagePath)
    packageJson = {...packageJson, name: projectName}

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + os.EOL)
    resolve()
  })
}
// 安装依赖
function install () {
  return new Promise((resolve, reject) => {
    let command = 'npm'
    let args = ['install', '--save', '--save-exact', '--loglevel', 'error']
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
      console.log()
      console.log(chalk.green(`      cd ${projectName}`))
      console.log()
      console.log(chalk.green('      npm run dev'))
    })
    console.log()
    console.log(chalk.green(`正在安装依赖...`))
  })
}
// 执行dev
function runDev () {
  return new Promise((resolve, reject) => {
    console.log()
    spinner.succeed('安装依赖成功')
    const webpackDevPath = path.join(process.cwd(), 'webpack.dev.js')
    let devJson = require(webpackDevPath)
    let port = devJson['devServer'].port
    const child = spawn('npm', ['run', 'dev'], { stdio: 'inherit' })
    child.on('close', code => {
      if (code !== 0) {
        reject(code);
        return;
      }
      spinner.stop()
      console.log()
      spinner.succeed(`启动成功`)
      resolve()
    })
    console.log()
    console.log(chalk.green(`启动项目（http://localhost:${port})...`))
  })
}