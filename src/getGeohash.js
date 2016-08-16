/*
 * 获取用户地址 Geohash
 * 依赖：HybridAPI Geohash.js Promise 以及 fetch
 * 优先级：url?geohash=XXX > HybridAPI > Navigator > restAPI
 */

import resolveFetch from './resolveFetch.js'

const APIHOST = `${location.origin.replace(/\:\/\/(h|h5)\./, '://m.')}/restapi`
const APIURL = `${APIHOST}/v1/cities?type=guess`
const $get = url => window.fetch(url).then(res => resolveFetch(res))

const wait = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

const getParmaHash = () => {
  if (!window.UParams) return ''
  return window.UParams().geohash || ''
}

const getAppHash = (timeout = 5000, interval = 500) => {
  const tryOnce = () => {
    return new Promise((resolve, reject) => {
      window.hybridAPI.getGlobalGeohash(geohash => {
        if (!geohash) return reject()
        resolve(geohash)
      })
    })
  }
  return new Promise((resolve, reject) => {
    let appHash = ''
    let timmer = -1
    let stop = () => {
      clearInterval(timmer)
    }
    let loop = () => {
      if (appHash) return stop()
      tryOnce().then(hash => {
        if (appHash) return
        appHash = hash
        stop()
        resolve(hash)
      })
    }
    timmer = setInterval(loop, interval)
    loop()
    wait(timeout).then(stop)
  })
}

const getNavigatorHash = () => {
  if (!navigator.geolocation) return Promise.reject()
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      resolve(window.Geohash.encode(position.coords.latitude, position.coords.longitude))
    }, reject)
  })
}

const getAPIHash = () => {
  return $get(APIURL).then(coords => {
    return window.Geohash.encode(coords.latitude, coords.longitude)
  })
}

const getGeohash = (timeout = 5000) => {
  let appHash = ''
  let navigatorHash = ''
  let apiHash = ''
  return new Promise((resolve, reject) => {
    let hash = getParmaHash()
    if (hash) return resolve(hash)
    if (/Eleme/.test(navigator.userAgent)) {
      getAppHash(timeout).then(hash => {
        appHash = hash
        resolve(hash)
      }).catch(() => {
        let hash = navigatorHash || apiHash
        if (hash) return resolve(hash)
        reject()
      })
      wait(timeout / 2).then(() => {
        if (appHash) return
        return getNavigatorHash().then(hash => {
          navigatorHash = hash
        })
      }).catch(() => {})
      getAPIHash().then(hash => {
        apiHash = hash
      }).catch(() => {})
    } else {
      let navigatorFailed = false
      let apiFailed = false
      getNavigatorHash().then(resolve).catch(() => {
        if (apiHash) return resolve(apiHash)
        if (apiFailed) reject()
        navigatorFailed = true
      })
      getAPIHash().then(hash => {
        apiHash = hash
        if (navigatorFailed) return resolve(apiHash)
      }).catch(() => {
        if (navigatorFailed) reject()
        apiFailed = true
      })
      wait(timeout).then(reject)
    }
  })
}

getGeohash.getParmaHash = getParmaHash
getGeohash.useApp = getAppHash
getGeohash.useGeoAPI = getNavigatorHash
getGeohash.useRestAPI = getAPIHash

export default getGeohash
