export const addLeadingZero = (num: number): string => `${+num < 10 ? '0' : ''}${num}`
