function removeFirstline(str) {
  return str.substr(str.indexOf("\n") + 1);
}

module.exports = removeFirstline;
