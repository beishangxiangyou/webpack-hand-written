const path = require('path')
const fs = require('fs')
const babylon = require('babylon')
const t = require('@babel/types')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const ejs = require('ejs')
const {SyncHook} = require('tapable')

// babylon 主要就是把源码转换成ast
// @babel/traverse
// @babel/types
// @babel/generator

class Compiler {
  constructor (config) {
    this.config = config  // entry output
    // 需要保存入口文件的路径
    this.entryId = undefined // './src/index.js'
    this.modules = Object.create(null)  // 需要保存所有的模块依赖
    this.entry = config.entry
    this.root = process.cwd() // 工作路径
    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook(),
    }
    const plugins = this.config.plugins
    if (Array.isArray(plugins)) {
      plugins.forEach(plugin => {
        plugin.apply(this)
      })
    }
    this.hooks.afterPlugins.call()
  }

  getSource (modulePath) {
    const rules = this.config.module.rules
    let content = fs.readFileSync(modulePath, 'utf8')
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      const {test, use} = rule
      let len = use.length - 1
      if (test.test(modulePath)) { // 这个模块需要loader来转换
        const normalLoader = () => {
          const loader = require(use[len--])
          content = loader(content)
          if (len >= 0) normalLoader()
        }
        normalLoader()
      }
    }
    return content
  }

  parse (source, parentPath) { // 解析源码，AST
    const ast = babylon.parse(source)
    const dependencies = [] // 依赖数组
    // https://astexplorer.net/
    traverse(ast, {
      CallExpression (p) {
        const node = p.node
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          let moduleName = node.arguments[0].value // 模块的引用名字
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
          moduleName = './' + path.join(parentPath, moduleName) // ./src/a.js
          dependencies.push(moduleName)
          node.arguments = [t.stringLiteral(moduleName)]
        }
      }
    })
    const sourceCode = generator(ast).code
    return {sourceCode, dependencies}
  }

  buildModule (modulePath, isEntry) { // 构建模块
    // 拿到模块内容
    const source = this.getSource(modulePath)
    // 模块id modulePath = modulePath - this.root
    const moduleName = './' + path.relative(this.root, modulePath)
    if (isEntry) {
      this.entryId = moduleName // 保存入口的名字
    }
    // 解析，改造source源码，返回一个依赖列表
    const {sourceCode, dependencies} = this.parse(source, path.dirname(moduleName)) // ./src
    this.modules[moduleName] = sourceCode // 模块路径与模块内容对应起来
    dependencies.forEach(dep => { // 子模块的递归加载
      this.buildModule(path.join(this.root, dep), false)
    })

  }

  emitFile () { // 发射文件
    const {path: _path, filename} = this.config.output
    const main = path.join(_path, filename)
    const templateStr = this.getSource(path.join(__dirname, 'main.ejs'))
    const code = ejs.render(templateStr, {entryId: this.entryId, modules: this.modules})
    this.assets = Object.create(null)
    this.assets[main] = code
    fs.writeFileSync(main, this.assets[main])
  }

  run () { // 执行
    this.hooks.run.call()
    this.hooks.compile.call()
    this.buildModule(path.resolve(this.root, this.entry), true) // 创建模块的依赖关系
    this.hooks.afterCompile.call()
    this.emitFile() // 发射一个文件，打包后的文件
    this.hooks.emit.call()
    this.hooks.done.call()
  }
}

module.exports = Compiler
