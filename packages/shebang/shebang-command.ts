import command from './command'
import firstLine from './first-line'
export const shebangCommand = async (filename: string) => command(await firstLine(filename))
export default shebangCommand
