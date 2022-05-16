import HTML5 from 'react-dnd-html5-backend-cjs'
import { createDndContext } from 'react-dnd-cjs'

const context = createDndContext(HTML5)

export const { dragDropManager } = context
export { DndProvider } from 'react-dnd-cjs'
