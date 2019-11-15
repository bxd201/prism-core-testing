function noOp () { }

// Setup global URL object

if (typeof window.URL === 'undefined') {
  Object.defineProperty(window, 'URL', { value: {}, writable: true })
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp })
  Object.defineProperty(window.URL, 'revokeObjectURL', { value: noOp })
}
