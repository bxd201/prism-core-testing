// @flow
function appendToBody (el: Element): void {
  document && document.body && document.body.appendChild(el)
}

export default appendToBody
