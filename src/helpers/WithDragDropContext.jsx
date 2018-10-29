// @flow
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

// context singleton
let context: Function

export function withDragDropContext<P> (Component: React.ComponentClass<P> | React.StatelessComponent<P>): React.ComponentClass<P> {
  // ensure a singleton instance of the context exists
  if (!context) {
    context = DragDropContext(HTML5Backend)
  }

  return context(Component)
}
