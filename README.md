# 利用 node 写一个基于文件的 todo 命令行工具

**功能**
- 列出所有的 todo
- 新增 todo
- 编辑 todo
- 删除 todo
- 标记 todo 为已完成/未完成

## 初始化

1. 运行`yarn init -y`，添加`package.json`文件
2. 运行`yarn add commander`，引入[commander](https://github.com/tj/commander.js/#installation)库
3. 创建`cli.js`，具体使用参考官方文档
   ```
   const program = require('commander');
   
   program
     .option('-x, --xxx', 'what the x')
   program
     .command('add')
     .description('add a task')
     .action(() => {
       console.log('hi');
     });
   
   program.parse(process.argv);
   
   console.log(program.xxx)
   ```
4. 初始化 add，运行`node cli add`，node + 文件名 + 子命令，输出`hi`
5. add 后面接任务名，`node cli add go here go there`，输出`go here go there`
   ```
   program
     ...
     .action((x,y,k,j) => {
       console.log(x,y,k,j);
     });
   ```
   使用es6语法，输出`[ 'go', 'here', 'go', 'there' ]`
   ```
     .action((...args) => {
       const words = args.slice(0,-1).join(' ')
       console.log(words);
     });
   ```
6. 初始化 clear，
   ```
   program
     .command('clear')
     .description('add all tasks')
     .action((...args) => {
       console.log('this is clear');
     });
   ```
   运行`node cli -h`,输出
   ```
   Commands:
     add         add a task
     clear       add all tasks
   ```
接下来实现 add,clear 功能

## 实现 add 功能

1. 创建 index.js，实现其所有功能，先测试
   ```
   module.exports.add = (title) => {
     console.log('add')
   }
   ```
2. cli.js 中引入
   ```
   const api = require('./index.js')
   ...
   program
     .command('add')
     .description('add a task')
     .action((...args) => {
       const words = args.slice(0,-1).join(' ')
       api.add(words)
     });
   ```
   运行 `node cli add`, 输出 `add`，表示测试成功
   tips：点击 Run > Edit Configurations,添加 node.js,配置 javascript file: cli.js ,application parameters: add,配置完成后，直接 run 就可快速执行了
   
3. 实现 add 函数：
   把输入的任务名添加到数据库中(home 目录中),
   ```
   const homedir = require('os').homedir();
   const home = process.env.HOME || homedir //优先获取用户设置的 home
   
   module.exports.add = (title) => {
     console.log(home)
   }
   ```
   在 home 目录中创建文件夹来存贮任务名
   ```
   const homedir = require('os').homedir();
   const home = process.env.HOME || homedir //优先获取用户设置的 home
   const p = require('path')
   const fs = require('fs')
   const dbPath = p.join(home, '.todo')
   
   module.exports.add = (title) => {
     //读取之前的任务，如果没有就添加
     fs.readFile(dbPath, {flag: 'a+'}, (error, data)=> {
       if(error) {
         console.log(error)
       }else {
         let list
         try {
           list = JSON.parse(data.toString())
         }catch (error2) {
           list = []
         }
         // console.log(list)
         const task = {
           title: title,
           done: false
         }
         list.push(task)
         const string = JSON.stringify(list)
         fs.writeFile(dbPath, string, (error3) => {
           if(error3) {
             console.log(errors)
           }
         })
       }
     })
   }
   ```
3. 优化：拆分代码，面向接口编程
   index.js
   ```
   ...
   module.exports.add = async (title) => {
     //读取之前的任务，如果没有就添加
     const list = await db.read()
     //往里面添加一个 title 任务
     list.push({title, done: false})
     //存贮任务到文件
     await db.write(list)
   }
   ```
   新建 db.js 文件，实现其功能
   ```
   const homedir = require('os').homedir();
   const home = process.env.HOME || homedir //优先获取用户设置的 home
   const p = require('path')
   const fs = require('fs')
   const dbPath = p.join(home, '.todo')
   
   const db = {
     read(path = dbPath) {
       return new Promise((resolve,reject) => {
         fs.readFile(path, {flag: 'a+'}, (error, data)=> {
           if(error) return reject(error)
             let list
             try {
               list = JSON.parse(data.toString())
             }catch (error2) {
               list = []
             }
             resolve(list)
         })
       })
     },
     write(list, path = dbPath) {
       return new Promise((resolve, reject)=> {
         const string = JSON.stringify(list)
         fs.writeFile(path, string + '\n', (error)=> {
           if(error) return reject(error)
           resolve()
         })
       })
     }
   }
   module.exports = db
   ```
   测试，输入`node cli.js add 买水`，`cat ~/.todo`,输出`[{"title":"买水","done":false}]`

## 实现 clear 功能

cli.js 
```
program
  .command('clear')
  .description('add all tasks')
  .action(() => {
    api.clear()
  });
```
index.js
```
module.exports.clear = async (title) => {
  await db.write([])
}
```
测试，输入`node cli.js clear`,`cat ~/.todo`,输出`[]`

## 列出所有的 todo

当用户输入`node cli.js`时，展示出所有的 todo，那么如何知道用户输入了几个参数呢？

通过`process.argv`,cli.js中`console.log(process.argv)`，输入`node cli.js xxx`

输出了3个参数
```
[ '/usr/local/bin/node',
  '/Users/a/projects/node-todo-1/cli.js',
  'xxx' ]
```
所以,cli.js
```
if(process.argv.length ===2) {
  //说明用户直接运行 node cli.js
  api.showAll()
}
```
index.js
```
module.exports.showAll = async () => {
  console.log('show all')
}
```
测试，输入`node cli.js`时，输出`show all`

**实现 showAll**

index.js
```
module.exports.showAll = async () => {
  //读取之前的任务
  const list = await db.read()
  //打印之前的任务
  list.forEach((task,index) => {
    console.log(`${task.done ? '[x]' : '[_]'} ${index + 1} - ${task.title}`)
  })
}
```
测试，输入`node cli.js`,输出`[_] 1 - 买水 [_] 2 - 买泡面`，接下来实现，让用户可以操作任务

## 实现编辑，删除，标记功能

引入 inquirer.js 库，输入`yarn add inquirer`,用法参考文档

idnex.js
```
const inquirer = require('inquirer')

module.exports.showAll = async () => {
  //读取之前的任务
  const list = await db.read()
  //对任务进行操作
  inquirer
    .prompt({
      type: 'list',
      name: 'index',
      message: '请选择你想操作的任务?',
      choices: [{name: '退出', value: '-1'}, ...list.map((task, index) => {
        return {name: `${task.done ? '[x]' : '[_]'} ${index + 1} - ${task.title}`, value: index.toString()}
      }), {name: '+ 创建任务', value: '-2'}]
    })
    .then(answer => {
      const index = parseInt(answer.index)
      if(index >= 0) {
        //选中了一个任务
        inquirer.prompt({
          type: 'list',
          name: 'action',
          choices: [
            {name: '退出', value: 'quit'},
            {name: '已完成', value: 'markAsDone'},
            {name: '未完成', value: 'markAsUndone'},
            {name: '改标题', vaule: 'updateTitel'},
            {name: '删除', value: 'remove'}
          ]
        }).then(answer2 => {
          switch (answer2.action) {
            case 'markAsDone':
              list[index].done = true
              db.write(list)
              break
            case 'markAsUndone':
              list[index].done = false
              db.write(list)
              break
            case 'updateTitle':
              inquirer.prompt({
                type: 'input',
                name: 'title',
                message: '新的标题',
                default: list[index].title
              }).then(answer => {
                list[index].title = answer.title
                db.write(list)
              })
              break
            case 'remove':
              list.splice(index, 1)
              db.write(list)
              break
          }
        })
      }else if(index === -2) {
        //创建任务
        inquirer.prompt({
          type: 'input',
          name: 'title',
          message: '输入任务标题',
        }).then(answer => {
          list.push({
            title: answer.title,
            done: false
          })
          db.write(list)
        })
      }
    });
}
```
大家可自行测试，输入`node cli.js`...

## 优化代码

封装函数，重命名，提高代码可读性

index.js
```
const db = require('./db.js')
const inquirer = require('inquirer')

module.exports.add = async (title) => {
  //读取之前的任务，如果没有就添加
  const list = await db.read()
  //往里面添加一个 title 任务
  list.push({title, done: false})
  //存贮任务到文件
  await db.write(list)
}

module.exports.clear = async () => {
  await db.write([])
}

function markAsDone(list, index) {
  list[index].done = true
  db.write(list)
}
function markAsUndone(list, index) {
  list[index].done = false
  db.write(list)
}
function updateTitle(list, index) {
  inquirer.prompt({
    type: 'input',
    name: 'title',
    message: '新的标题',
    default: list[index].title
  }).then(answer => {
    list[index].title = answer.title
    db.write(list)
  })
}
function remove(list, index) {
  list.splice(index, 1)
  db.write(list)
}

function askForAction(list, index) {
  const actions = {
    markAsDone,
    markAsUndone,
    remove,
    updateTitle
  }
  inquirer.prompt({
    type: 'list',
    name: 'action',
    choices: [
      {name: '退出', value: 'quit'},
      {name: '已完成', value: 'markAsDone'},
      {name: '未完成', value: 'markAsUndone'},
      {name: '改标题', vaule: 'updateTitel'},
      {name: '删除', value: 'remove'}
    ]
  }).then(answer2 => {
    const action = actions[answer2.action]
    action && action(list, index)
  })
}

function askForCreateTask(list) {
  inquirer.prompt({
    type: 'input',
    name: 'title',
    message: '输入任务标题',
  }).then(answer => {
    list.push({
      title: answer.title,
      done: false
    })
    db.write(list)
  })
}

function printTasks(list) {
  inquirer
    .prompt({
      type: 'list',
      name: 'index',
      message: '请选择你想操作的任务?',
      choices: [{name: '退出', value: '-1'}, ...list.map((task, index) => {
        return {name: `${task.done ? '[x]' : '[_]'} ${index + 1} - ${task.title}`, value: index.toString()}
      }), {name: '+ 创建任务', value: '-2'}]
    })
    .then(answer => {
      const index = parseInt(answer.index)
      if(index >= 0) {
        askForAction(list, index)
      }else if(index === -2) {
        askForCreateTask(list)
      }
    });
}

module.exports.showAll = async () => {
  //读取之前的任务
  const list = await db.read()
  //打印之前的任务
  printTasks(list)
}
```
## 发布到 npm

配置 package.json
```
{
  "name": "node-todos",
  "bin": {
    "t": "cli.js"
  },
  "file": [
    "*.js"
  ],
  "version": "0.0.1",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "commander": "^3.0.2",
    "inquirer": "^7.0.0"
  }
}
```
运行 `chmod +x cli.js`,把 cli.js 变成 t 命令

发布前，记得把淘宝源切换成原始源

发布：
1. npm adduser
2. npm publish

用户使用：
1. yarn global add node-todos
2. t







