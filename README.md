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
   module.exports.add = () => {
     console.log('add')
   }
   ```
2. cli.js 中引入
   ```
   
   ```




