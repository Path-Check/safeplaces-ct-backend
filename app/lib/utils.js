
const getMin = (data, key) => {
  return data.reduce((min, p) => p[key] < min ? p[key] : min, data[0][key]);
}

const getMax = (data, key) => {
  return data.reduce((max, p) => p[key] > max ? p[key] : max, data[0][key]);
}

module.exports = {
  getMin, getMax
}