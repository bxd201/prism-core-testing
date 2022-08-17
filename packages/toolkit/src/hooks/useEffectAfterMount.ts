import { useEffect, useRef } from 'react'

/**
 * Just like the useEffect hook, except it doesn't run on initial mount. This is useful for firing callbacks provided by parents
 * when changes take place, since you don't want those to fire on initial render.
 * @example https://kentcdodds.com/blog/compound-components-with-react-hooks
 * @param {function} cb Callback function to run when changes are detected AFTER initial component mount
 * @param {any[]} dependencies Array of dependencies to watch for changes
 */

export default function useEffectAfterMount(cb, dependencies): void {
  const justMounted = useRef(true)

  useEffect(() => {
    if (!justMounted.current) {
      return cb()
    }
    justMounted.current = false
  }, dependencies)
}
