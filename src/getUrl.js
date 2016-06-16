/**
 * @param url {String} - 路由（E.g https://h5.ele.me/sales/，http/https 必须要）
 * @param param {Object} - 路由中所带的参数
 * @param type {String} - hash || search （hash is default.）
 * @param animationType {Number} - 页面打开方式——0： 新页面自下而上压进, 1：新页面自右向左压进
 * @return 完整的 url
 */

// 检测 object 的 type
const is = (object, type) => {
  let truthType = Object.prototype.toString.call(object).slice(8, -1)
  return new RegExp(truthType, 'i').test(type)
}

const getUrl = (url, param = {}, type = 'hash', animationType = 1) => {
  let result = ''
  if (!is(param, 'Object')) console.warn('param must be an object.')

  for (var key in param) {
    var value = param[key]

    if (is(value, 'Array') || is(value, 'Object')) {
      result += `&${key}=${encodeURIComponent(JSON.stringify(value))}`
    } else {
      result += `&${key}=${value}`
    }
  }

  result = `${url}${type === 'hash' ? '#' : '?'}${result.replace(/^&/, '')}`

  // 如果在饿了么 APP 中，自动添加 schma
  if (/Eleme/.test(navigator.userAgent)) {
    result = `eleme://web?url=${encodeURIComponent(result)}&animation_type=${animationType}`
  }

  return result
}

export default getUrl
