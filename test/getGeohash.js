'use strict';
import userAgent from './userAgent.js'

const isApp = /Eleme/.test(navigator.userAgent)
let historyCount = 0
let hackUrl = url => {
  window.history.pushState({}, '', url)
  historyCount++
}
let resetHistory = (callback) => {
  if (!historyCount) return callback()
  window.history.go(-historyCount)
  historyCount = 0
  setTimeout(callback, 500) // 坑
}

describe('getGeohash', function () {
  this.timeout(6000)
  const getGeohash = Utils.default.getGeohash

  describe('function correctly', function () {
    afterEach(resetHistory)
    it('use parma', function () {
      hackUrl('?geohash=parma')
      expect(getGeohash.getParmaHash()).to.equal('parma')
      hackUrl('?geohash=')
      expect(getGeohash.getParmaHash()).to.equal('')
      hackUrl('?!')
      expect(getGeohash.getParmaHash()).to.equal('')
    })
    it('use App', function () {
      if (!isApp) this.skip()
      return expect(getGeohash.useApp()).to.eventually.be.not.empty
    })
    it('use GeoAPI', function () {
      return expect(getGeohash.useGeoAPI()).to.eventually.be.not.empty
    })
    it('use RestAPI', function () {
      return expect(getGeohash.useRestAPI()).to.eventually.be.not.empty
    })
  })

  describe('priority', function () {
    // reset hacks
    let origin = {
      getGlobalGeohash: window.hybridAPI.getGlobalGeohash,
      getCurrentPosition: navigator.geolocation.getCurrentPosition,
      fetch: window.fetch,
    }
    let reset = (done) => {
      window.hybridAPI.getGlobalGeohash = origin.getGlobalGeohash
      navigator.geolocation.getCurrentPosition = origin.getCurrentPosition
      window.fetch = origin.fetch
      userAgent.reset()
      resetHistory(done)
    }
    afterEach(reset)
    // hacks
    const hackApp = enable => {
      if (enable) {
        userAgent.set('Rajax/1 Apple/iPhone8,2 iPhone_OS/10.0 Eleme/5.12')
      } else {
        userAgent.set('meituan/7.4.8 MDZZ')
      }
      window.hybridAPI.getGlobalGeohash = callback => {
        if (enable) return callback('FakeAppHash')
      }
    }
    const hackGeoApi = enable => {
      let fake = {
        timestamp: 1470912750608,
        coords: {
          accuracy: 30,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 31.234939599999997,
          longitude: 121.3771234,
          speed: null,
        },
      }
      navigator.geolocation.getCurrentPosition = (success, error) => {
        enable ? success(fake) : error()
      }
    }
    const hackRestAPI = enable => {
      window.fetch = () => {
        let response = new Response(JSON.stringify({
          'id': 1,
          'name': '上海',
          'abbr': 'SH',
          'area_code': '021',
          'sort': 1,
          'latitude': 31.23037,
          'longitude': 121.473701,
          'is_map': true,
          'pinyin': 'shanghai',
        }))
        return enable ? Promise.resolve(response) : Promise.reject()
      }
    }
    const test = (app, geo, api, method) => {
      hackApp(app)
      hackGeoApi(geo)
      hackRestAPI(api)
      return getGeohash().then(result => {
        return method().then(expected => {
          expect(result).to.equal(expected)
        })
      })
    }
    it('Parma first', function () {
      hackUrl('?geohash=parma')
      return expect(getGeohash()).to.eventually.equal('parma')
    })
    it('then APP', function () {
      let method = getGeohash.useApp
      return Promise.all([
        test(true, true, true, method),
        test(true, true, false, method),
        test(true, false, true, method),
        test(true, false, false, method),
      ])
    })
    it('then GeoAPI', function () {
      let method = getGeohash.useGeoAPI
      return Promise.all([
        test(false, true, true, method),
        test(false, true, false, method),
      ])
    })
    it('then RestAPI', function () {
      let method = getGeohash.useRestAPI
      return Promise.all([
        test(false, false, true, method),
      ])
    })
    it('then fail', function () {
      let method = getGeohash
      return expect(test(false, false, false, method)).to.be.rejected
    })
  })
})
