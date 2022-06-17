import React, { ComponentType, useEffect, useState } from 'react'
import axios from 'axios'
import Prism, { Color } from '@prism/toolkit'

export function withColorData(WrappedComponent: ComponentType) {
  const WithColorData = (props: any) => {
    const [sherwinColors, setSherwinColors] = useState<Color[]>([])

    useEffect(() => {
      axios
        .get('https://api.sherwin-williams.com/prism/v1/colors/sherwin')
        .then((r) => r.data)
        .then((colors) => setSherwinColors(colors))
    }, [])

    return (
      <Prism>
        <WrappedComponent {...props} colors={sherwinColors} />
      </Prism>
    )
  }
  return WithColorData
}
