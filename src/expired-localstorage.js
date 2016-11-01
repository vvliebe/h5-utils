/*
* 添加 / 获取可以过期的 localStorage
* */
export default expiredLocalStorage = {
  /**
   * @param key {String} - localStorage 中的 key 值
   * @param value {String} - localStroage 中的 value 值
   * @param expireDate {String|Int} - 可以被 new Date() 执行返回 Date 对象的值
   * @param expiredDay {Int} - 过期的天数
   * @return { key: String, value: String }
   */
  set({key, value, expiredDate, expiredDay}) {
    let storedObject = {
      value,
      expired: '',
    }
    if (expiredDate) {
      storedObject.expired = expiredDate
    }

    if (expiredDay) {
      storedObject.expired = Date.now() + expiredDay * 60 * 60 * 1000
    }
    localStorage.setItem(key, JSON.stringify(storedObject))
  },
  /**
   * 返回 localStorage 的值，并返回有没有过期的布尔值
   * @param key {String} - localStorage 中的 key 值
   * @return { value: null, expired: Boolean }
   */
  get(key) {
    const storedObject = JSON.parse(localStorage.getItem(key))
    if (!storedObject) {
      console.warn(`The key: ${key} you want are not found in localStorage`)
      return
    }

    const expired = Date.now() > new Date(storedObject.expired).getTime()

    return {
      value: storedObject.value,
      expired,
    }
  },
}