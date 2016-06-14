const resolveFetch = response => {
  const json = response.json()
  if (response.status >= 200 && response.status < 300) return json
  return json.then(Promise.reject.bind(Promise))
}

export default resolveFetch
