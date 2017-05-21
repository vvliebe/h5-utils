/*
 * 获取用户地址 Geohash
 * 依赖：HybridAPI Geohash.js Promise 以及 fetch
 * 优先级：url?geohash=XXX > HybridAPI > Navigator > restAPI
 */

import resolveFetch from './resolveFetch.js'

const API_PREFIX = /opensite/.test(document.domain) ? 'opensite-restapi' : 'mainsite-restapi'
const APIHOST = location.origin.replace(/\:\/\/(h|h5|opensite)\./, `://${API_PREFIX}.`)
const APIURL = `${APIHOST}/shopping/v1/cities/guess`
const $get = url => window.fetch(url).then(resolveFetch)

const wait = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

const getParamHash = () => {
  if (!window.UParams) return ''
  return window.UParams().geohash || ''
}

const getAppHash = (timeout = 5000, interval = 100) => {
  let intervalTimer = null

  const stop = () => {
    clearInterval(intervalTimer)
  }

  return new Promise((resolve, reject) => {
    if (!window.hybridAPI) {
      reject()
    }

    let loop = () => {
      window.hybridAPI.getGlobalGeohash(hash => {
        if (!hash) return
        stop()
        resolve(hash)
      })
    }
    
    intervalTimer = setInterval(loop, interval)
    loop()

    setTimeout(() => {
      stop()
      reject()
    }, timeout)
  })
}

const getNavigatorHash = (timeout = 5000) => {
  // Read more info: https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/getCurrentPosition
  if (!navigator.geolocation) return Promise.reject()
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      resolve(window.Geohash.encode(position.coords.latitude, position.coords.longitude))
    }, reject, {
      timeout,
      maximumAge: 10000,
    })
  })
}

const getAPIHash = () => {
  return $get(APIURL)
  .then(({ latitude, longitude }) => {
    return window.Geohash.encode(latitude, longitude)
  })
}

const browserMode = (timeout) => {
  // 通过原生 API 获取失败后,看下有没有 apiHash 没有的话直接 reject()
  return new Promise((resolve, reject) => {
    getNavigatorHash(timeout)
    .then(resolve)
    .catch(() => getAPIHash())
    .then(resolve)
    .catch(reject)

    setTimeout(reject, timeout)
  })
}

const appMode = (timeout) => {
  return new Promise((resolve) => {
    getAppHash(timeout * 2 / 3)
    .then(reslove)
    .catch(browserMode(timeout * 1 / 3))
  })
}

const getGeohash = (timeout = 10000) => {
  // 优先使用 URL 中传来的 geohash 参数
  let hash = getParamHash()
  if (hash) {
    return Promise.resolve(hash)
  }

  if (/Eleme/i.test(navigator.userAgent)) {
    return appMode(timeout)
  } else {
    return browserMode(timeout)
  }
}

getGeohash.getParamHash = getParamHash
getGeohash.useApp = getAppHash
getGeohash.useGeoAPI = getNavigatorHash
getGeohash.useRestAPI = getAPIHash

export default getGeohash
