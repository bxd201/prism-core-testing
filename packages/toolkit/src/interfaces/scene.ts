// NOTE: These Interfaces were initially copied from facets (packages/facets/src/shared/types/Scene.js.flow)
export interface FlatScene {
  id: number
  width: number
  height: number
  variantNames: string[]
  // variants prop is only used during transformation and should not be used at rest!
  variants?: any[] | null
  sceneType: string
  uid: string
  description: string
}

export interface FlatVariant {
  sceneUid: string
  sceneId: number
  variantName: string
  sceneType: string
  // blob urls are not currently set when initialized but after they have been loaded
  surfaces: Surface[]
  image: string
  thumb: string
  normalizedImageValueCurve: string
  sceneCategories?: string[] | null
  expertColorPicks: number[] | null
  isFirstOfKind?: boolean
}

export interface Surface {
  id: number
  role?: string
  thumb?: string
  hitArea?: string
  shadows?: string
  highlights?: string
  surfaceBlobUrl?: string
}
