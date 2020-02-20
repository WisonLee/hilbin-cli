#!/usr/bin/env node

const program = require('commander')
const packageJson = require('../package')

program
  .version(packageJson.version)
  .command('init [project-name]', '初始项目工程')
  .alias('i')
  .option('-y', '快速初始项目工程')
  .command('create [file-name]', '创建文件')
  .arguments('[file-name]')
  .alias('c')
  .parse(process.argv)