export function getAlignment (prefix = '', type) {
  switch (type) {
    case 'start':
      return `${prefix}--align-start`
    case 'end':
      return `${prefix}--align-end`
    case 'center':
      return `${prefix}--align-center`
    case 'justify':
      return `${prefix}--align-justify`
  }

  return ''
}
