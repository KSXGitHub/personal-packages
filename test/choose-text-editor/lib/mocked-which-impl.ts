import programListPromise from './programs'

export async function mockedWhichImpl(program: string) {
  if ((await programListPromise).includes(program)) return `/usr/bin/${program}`
  throw new Error(`not found: ${program}`)
}

export default mockedWhichImpl
