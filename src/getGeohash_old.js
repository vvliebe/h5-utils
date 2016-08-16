/*
 * 获取用户地址 Geohash
 * 依赖：HybridAPI Geohash.js Promise 以及 fetch
 * 优先级：HybridAPI > Navigator > restAPI
 */

import resolveFetch from './resolveFetch.js'

const isApp = /Eleme/.test(navigator.userAgent)
const APIHOST = `//${document.domain.replace(/^(h|h5)\./, 'm.')}/restapi`
const $get = url => window.fetch(url).then(res => resolveFetch(res))

let userGeohash

const getAppHash = () => {
  console.log('try to get app hash')
  window.hybridAPI.getGlobalGeohash(geohash => {
    if (geohash) userGeohash.geohash = geohash
    console.log('got app hash: ' + geohash)
  })
}

const getNavigatorHash = key => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(position => {
    userGeohash[key] = window.Geohash.encode(position.coords.latitude, position.coords.longitude)
  })
}

const getAPIHash = () => {
  $get(APIHOST + '/v1/cities?type=guess')
  .then(json => {
    userGeohash.restapi = window.Geohash.encode(json.latitude, json.longitude)
  })
  .catch(() => {})
}

const getGeohash = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    let isTrying = null

    const clearTrying = window[isApp ? 'clearInterval' : 'clearTimeout'].bind(null, isTrying)

    const useBestHash = () => {
      clearTrying()

      if (userGeohash.geohash) return
      if (userGeohash.navigator) return userGeohash.geohash = userGeohash.navigator
      if (userGeohash.restapi) return userGeohash.geohash = userGeohash.restapi

      reject()
    }

    const useAppMode = () => {
      getAppHash()
      isTrying = setInterval(getAppHash, 500)

      setTimeout(useBestHash, timeout)
      setTimeout(() => {
        if (userGeohash.geohash) return
        getNavigatorHash('navigator')
        getAPIHash()
      }, timeout / 2)
    }

    const useWebMode = () => {
      isTrying = setTimeout(useBestHash, timeout)
      getNavigatorHash('geohash')
      getAPIHash()
    }

    let _geohash = ''

    userGeohash = Object.create(null)
    Object.defineProperty(userGeohash, 'geohash', {
      get() {
        return _geohash
      },
      set(value) {
        if (!value) return
        _geohash = value
        clearTrying()
        resolve(value)
      }
    })

    if (window.UPrams) {
      const urlGeohash = new window.UParams().geohash
      if (urlGeohash) return userGeohash.geohash = urlGeohash
    }

    isApp ? useAppMode() : useWebMode()
  })
}

export default getGeohash
