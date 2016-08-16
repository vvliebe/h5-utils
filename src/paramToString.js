const paramToString = param => {
  if (Object.prototype.toString.call(param).slice(8, -1) !== 'Object') {
    throw 'param 必须是一个 object 对象'
  }
  var result = []
  for (let key in param) {
    let value = param[key]
    if (Array.isArray(value)) {
      result = result.concat(value.map(item => `${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`))
    } else if (typeof value === 'object' && value) {
      value = JSON.stringify(value)
      result.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    } else {
      result.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }
  return result.join('&')
};

export default paramToString
