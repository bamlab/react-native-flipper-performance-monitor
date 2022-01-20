export const round = (n: number, decimals: number) => {
  const power = Math.pow(10, decimals);
  return Math.floor(n * power) / power;
};
