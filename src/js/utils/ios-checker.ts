export const iosChecker = () => {
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  const iosDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ]

  const isIosDevice = iosDevices.includes(platform) || (userAgent.includes('Mac') && 'ontouchend' in document)

  const isIpadMac = userAgent.includes('Mac') && navigator.maxTouchPoints > 1

  return isIosDevice || isIpadMac
}

export const getIOSVersion = () => {
  const userAgent = navigator.userAgent
  const iosVersionMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/)

  if (iosVersionMatch) {
    const majorVersion = parseInt(iosVersionMatch[1], 10)
    const minorVersion = parseInt(iosVersionMatch[2], 10)
    const patchVersion = iosVersionMatch[3] ? parseInt(iosVersionMatch[3], 10) : 0

    return {
      major: majorVersion,
      minor: minorVersion,
      patch: patchVersion,
      version: `${majorVersion}.${minorVersion}.${patchVersion}`
    }
  }

  return null
}

export const isIPhone12OrOlder = () => {
  if (!iosChecker()) {
    return false
  }

  const iosVersion = getIOSVersion()

  if (!iosVersion) {
    return false
  }

  // iPhone 12 поддерживает iOS 14+, поэтому проверяем iOS 14 и ниже
  return iosVersion.major <= 14
}
