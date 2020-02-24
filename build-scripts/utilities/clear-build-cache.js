var fs = require('fs')

function deleteFolderRecursive (path) {
  if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file

      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })

    console.log(`Deleting directory "${path}"...`)
    fs.rmdirSync(path)
  }
};

console.log('Clearing hard-source cache...')
deleteFolderRecursive('./cache')
console.log('Successfully cleared hard-source cache!')

console.log('Clearing terser cache...')
deleteFolderRecursive('./node_modules/.cache')
console.log('Successfully cleared terser cache!')

console.log('Emptying dist...')
deleteFolderRecursive('./dist')
console.log('Successfully emptied dist directory!')
