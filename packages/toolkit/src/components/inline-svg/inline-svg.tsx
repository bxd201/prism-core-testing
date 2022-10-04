import React, { useEffect, useRef,useState } from 'react'
import axios from 'axios'

export interface  InlineSVGProps {
  url: string
  svgId: string
  loadedCallback?: (failed: boolean) => void
}

function parseSVG(content: string, svgId: string): SVGElement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/xml')
  const svg = doc.querySelector('svg')
  svg.setAttribute('id', `mask__${svgId}`)

  return svg
}

export default function InlineSVG(props: InlineSVGProps): JSX.Element {
  const {url, svgId, loadedCallback} = props
  const ref = useRef<HTMLSpanElement | null>(null)
  const svgRef = useRef<SVGElement | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const handleSVGLoad = (e: Event): void => {
    e.preventDefault()
    setHasLoaded(true)
  }

  useEffect(() => {
    axios.get(url).then(data => {
      svgRef.current = parseSVG(data.data, svgId)
      svgRef.current.addEventListener('load', handleSVGLoad)
      ref.current.append(svgRef.current)
      // I don't know why, but the load callback doesn't fire when imported in PRISM,
      // so call success eagerly to make work -RS
      setHasLoaded(true)
    }).catch((err:Error) => {
      loadedCallback(!!err)
    })

    return () => {
      if (svgRef.current) {
        svgRef.current.removeEventListener('load', handleSVGLoad)
      }
    }
  }, [])

  useEffect(() => {
    if (hasLoaded && loadedCallback) {
      // No error so pass
      loadedCallback(false)
    }
  }, [hasLoaded])

  return <span
    ref={ref}
    className={`absolute h-0 w-0 invisible`}
    style={{zIndex: -1}}
  >
  </span>
}
