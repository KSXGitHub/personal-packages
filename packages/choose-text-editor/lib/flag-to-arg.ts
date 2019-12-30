export const flag2arg = (flag: string) => (flag.length === 1 ? '-' : '--') + flag
export default flag2arg
