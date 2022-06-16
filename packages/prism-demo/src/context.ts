import { createContext } from 'react'
import { Color } from './types'

export interface IContext {
  addLpColor: (color: Color) => void
  colors: Color[],
  lpColors?: Color[],
  resetLpColors: (colors: Color[]) => void
}

const Context = createContext<Partial<IContext>>({})

export default Context