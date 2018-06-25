const path = require('path')
const fs = require('fs')
const solc = require('solc')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function execute() {
    const contractPath = path.resolve(
        __dirname,
        'contracts',
        'Apodos.sol'
    )
    const outputPath = path.resolve(
        __dirname,
        'compiled',
        'Apodos.json'
    )
    const source = await readFile(contractPath, 'utf8')
    const output = solc.compile(source, 1)

    if(output.errors){
        output.errors.map((e) => {
            console.log(e);
        });
        return
    }

    const str = JSON.stringify(output.contracts[':Apodos'])
    await writeFile(outputPath, str, 'utf8')
}

execute()