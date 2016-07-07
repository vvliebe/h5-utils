/**
 * @param {Object} arguments
 * @param {Number} arguments.id - 商家 id
 * @param {Array} arguments.entities - web-cart 中的商品
 * @param {Function} arguments.callback - 下单成功后 APP 会调用这个方法。比如这个 Function 的作用是用来清空本地购物车
 */

export default ({ id, entities, callback }) => {
  const cart_operations = JSON.stringify({
    clear_cart: true,
    add_foods: entities.map(({ id, quantity, specs }) => ({
      id,
      quantity,
      specs: specs.map(spec => spec.value),
    })),
  })

  try {
    let bridge = window.WebViewJavascriptBridge
    if (!bridge) return
    if (bridge.init && !bridge.inited) {
      bridge.init()
      bridge.inited = true
    }
    bridge.registerHandler('clearCart', callback)
  } catch (error) {
    throw JSON.stringify(error)
  }

  // connect to APP checkout page.
  setTimeout(() => {
    location.href = `eleme://checkout?restaurant_id=${id}&cart_operations=${cart_operations}`
  }, 100)
}
