export function createPrismEmbedScript (callback, version) {
  const url = `https://prism.sherwin-williams.com/${version || '2.3.1-develop'}/embed.js`
  const script = document.createElement('script')
  script.addEventListener('load', callback)
  script.src = url

  return script
}

export function handlePromptForPRISMVersion (defaultVersion) {
  console.log(
    '%c To change PRISM version open an incognito window and paste window.localStorage.setItem(\'devOptions\', JSON.stringify({ promptForPRISMVersion: true })) and then refresh the page.',
    'color: #ffff; background: #4B0082')
  const devOptions = JSON.parse(window.localStorage.getItem('devOptions'))

  if (devOptions) {
    if (devOptions.PRISMVersion) {
      return devOptions.PRISMVersion
    }

    if (devOptions.promptForPRISMVersion) {
      const version = (window.prompt('Do you want to set a PRISM version?', defaultVersion) ?? '').trim() || defaultVersion
      devOptions.PRISMVersion = version
      window.localStorage.setItem('devOptions', JSON.stringify(devOptions))
      console.log(`%cPRISM version set to: ${version}`, 'color:#4B0082; background: #FFFACD')
    }

    return defaultVersion
  }

  return defaultVersion
}
