const getGeohash = () => {
  return new Promise((resolve, reject) => {
      const getGeohashFromApp = () => {
        if (!window.hybridAPI) {
          console.warn('please make sure the hybridAPI is existing when get geohash from app.')
          return reject('hybridAPI is required.')
        }

        let timeout = setTimeout(() => {
          reject('can\'t get geohash in any case.')
        }, 5000);

        hybridAPI.getGlobalGeohash(geohash => {
          clearTimeout(timeout)
          resolve(geohash)
        });
      };

      const UrlToken = window.UParams && new UParams(location.href) || {}
      if (UrlToken.geohash) {
        try {
          resolve(UrlToken.geohash)
        } catch(error) {
          getGeohashFromApp()
        }
      } else {
        getGeohashFromApp()
      }
    });
}

export default getGeohash
