#! /usr/bin/env node

// 找到执行当前命令的路径，找到webpack.config.js
const path = require('path')

// config配置文件
const DEFAULT_CONFIG_NAME = 'webpack.config.js'
const config = require(path.resolve(DEFAULT_CONFIG_NAME))

const Compiler = require('../lib/Compiler.js')
const compiler = new Compiler(config)
compiler.hooks.entryOption.call()

// 运行编译
compiler.run()
