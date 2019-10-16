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