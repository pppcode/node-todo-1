const db = require('./db.js')

module.exports.add = async (title) => {
  //读取之前的任务，如果没有就添加
  const list = await db.read()
  //往里面添加一个 title 任务
  list.push({title, done: false})
  //存贮任务到文件
  await db.write(list)
}

module.exports.clear = async (title) => {
  await db.write([])
}

module.exports.showAll = async () => {
  //读取之前的任务
  const list = await db.read()
  //打印之前的任务
  list.forEach((task,index) => {
    console.log(`${task.done ? '[x]' : '[_]'} ${index + 1} - ${task.title}`)
  })
}