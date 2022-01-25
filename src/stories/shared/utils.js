export function createPrismEmbedScript(callback, version) {
  const url = `https://prism.sherwin-williams.com/${version ? version : '2.3.1-develop'}/embed.js`
  const script = document.createElement('script')
  script.addEventListener('load', callback)
  script.src = url

  return script
}
