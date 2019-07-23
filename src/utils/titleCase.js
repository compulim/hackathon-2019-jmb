export default function titleCase(str) {
  return str.split(' ').map(([first = '', ...others]) => first.toUpperCase() + others.join('').toLowerCase());
}
