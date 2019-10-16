const program = require('commander');
const api = require('./index.js')

program
  .option('-x, --xxx', 'what the x')
program
  .command('add')
  .description('add a task')
  .action((...args) => {
    const words = args.slice(0,-1).join(' ')
    console.log(words);
  });
program
  .command('clear')
  .description('add all tasks')
  .action((...args) => {
    console.log('this is clear');
  });

program.parse(process.argv);

console.log(program.xxx)