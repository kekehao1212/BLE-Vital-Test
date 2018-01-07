const formatTime = date => {
  const year =  date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export {formatTime}

/**
 * 分隔url
 * @example
 * ```
 * const parts = decomposeUrl('blahblah/blah?abc=1&def=good');
 * // parts = { abc: '1', def: 'good' }
 * ```
 * @param {string} url
 * @returns {{ [key: string ]: string }}
 */
export function decomposeUrl(url) {
  const [ _, queryParts ] = url.split('?');
  if (!queryParts) {
    return { }
  }

  const components = queryParts.split('&');
  const result = components.map(component => {
    const [ key, value ] = component.split('=');
    if (!key || !value) {
      return { }
    } else {
      return { [key]: value }
    }
  }).reduce((out, kvPair) => {
    return { ...out, ...kvPair }
  }, { });

  return result;
}
