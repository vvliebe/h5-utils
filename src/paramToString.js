const paramToString = param => {
  if (Object.prototype.toString.call(param).slice(8, -1) !== 'Object') {
    return 'param 必须是一个 object 对象'
  }
  var result = []
  for (let key in param) {
    let value = param[key]
    if (Array.isArray(value)) {
      result = result.concat(value.map(item => `${key}[]=${item}`))
    } else {
      result.push(`${key}=${value}`)
    }
  }
  return result.join('&')
};

export default paramToString
