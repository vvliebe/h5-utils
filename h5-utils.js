(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Utils = factory());
}(this, function () { 'use strict';

  var getGeohash = new Promise(function (resolve, reject) {
    var getGeohashFromApp = function getGeohashFromApp() {
      if (!window.hybridAPI) {
        console.warn('please make sure the hybridAPI is existing when get geohash from app.');
        return reject('hybridAPI is required.');
      }

      var timeout = setTimeout(function () {
        reject('can\'t get geohash in any case.');
      }, 5000);

      hybridAPI.getGlobalGeohash(function (geohash) {
        clearTimeout(timeout);
        resolve(Geohash.decode(geohash));
      });
    };

    var UrlToken = window.UParams && new UParams(location.href) || {};
    if (UrlToken.geohash) {
      try {
        resolve(Geohash.decode(UrlToken.geohash));
      } catch (error) {
        getGeohashFromApp();
      }
    } else {
      getGeohashFromApp();
    }
  });

  /**
   * @param {String} compare - 比较版本
   * @param {String} beCompared 被比较版本
   * @returns {Boolean} - 被比较版本是否比比较版本新
   */
  var compareVersion = function compareVersion(compare, beCompared) {
    if (!beCompared) {
      beCompared = window.navigator.userAgent.match(/Eleme\/([0-9]+)\.([0-9]+)/i);
      if (!beCompared) return false;
    }

    compare = compare.split('.');
    beCompared = beCompared.split('.');

    var result = void 0;
    compare.forEach(function (compareItem, index) {
      var beComparedItem = beCompared[index];
      if (typeof beComparedItem === 'undefined') beComparedItem = 0;
      if (typeof result !== 'undefined') return;

      var difference = Number(compareItem) - Number(beComparedItem);
      if (difference === 0) return;
      result = difference > 0;
    });
    return result;
  };

  var paramToString = function paramToString(param) {
    if (Object.prototype.toString.call(param).slice(8, -1) !== 'Object') {
      return 'param 必须是一个 object 对象';
    }
    var result = [];
    for (var key in param) {
      var value = param[key];
      if (Array.isArray(value)) {
        result = result.concat(value.map(function (item) {
          return key + '[]=' + item;
        }));
      } else {
        result.push(key + '=' + value);
      }
    }
    return result.join('&');
  };

  var resolveFetch = function resolveFetch(response) {
    var json = response.json();
    if (response.status >= 200 && response.status < 300) return json;
    return json.then(Promise.reject.bind(Promise));
  };

  var Utils = {
    getGeohash: getGeohash,
    compareVersion: compareVersion,
    paramToString: paramToString,
    resolveFetch: resolveFetch
  };

  return Utils;

}));