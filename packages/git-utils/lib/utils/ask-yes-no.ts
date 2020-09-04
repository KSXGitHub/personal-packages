import readline from 'readline'
import process from 'process'

export function askYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  })

  return new Promise((resolve, reject) => {
    rl.question(`${question} [Y/n] `, async answer => {
      rl.close()

      answer = answer.trim().toLowerCase()
      switch (answer.trim().toLowerCase()) {
        case 'n':
        case 'no':
          return resolve(false)
        case 'y':
        case 'yes':
          return resolve(true)
      }

      console.error("answer must either be 'yes' or 'no'")
      askYesNo(question).then(resolve, reject)
    })
  })
}

export default askYesNo
