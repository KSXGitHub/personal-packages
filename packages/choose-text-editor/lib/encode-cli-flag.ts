export const encodeCliFlag = (flag: string) => (flag.length === 1 ? '-' : '--') + flag
export default encodeCliFlag
