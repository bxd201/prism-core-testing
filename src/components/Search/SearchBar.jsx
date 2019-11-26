// @flow
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ButtonBar from '../GeneralButtons/ButtonBar/ButtonBar'
import { FormattedMessage } from 'react-intl'
import './SearchBar.scss'

export default ({ showCancelButton = true }: { showCancelButton: boolean }) => {
  const { url, params: { query = '' } } = useRouteMatch()
  const history = useHistory()
  const [value, setValue] = React.useState(query)

  React.useEffect(() => { // mutate url when input hasn't changed in 250ms
    const id = setTimeout(() => value !== query && history.push(value || './'), 250)
    return () => clearTimeout(id)
  }, [value])

  return (
    <form onSubmit={e => e.preventDefault()} className='SearchBar__search-form'>
      <div className='SearchBar'>
        <FontAwesomeIcon className='search-icon' icon={['fal', 'search']} size='lg' />
        <div className={`SearchBar__wrapper SearchBar__wrapper--with${query ? '-outline' : 'out-outline'}`}>
          <input value={value} className='SearchBar__input' onChange={e => setValue(e.target.value)} />
          {value.length > 1 &&
          <button type='button' className='SearchBar__clean' onClick={() => setValue('')}>
            <FontAwesomeIcon icon={['fas', 'times']} />
          </button>}
        </div>
      </div>
      {showCancelButton && <ButtonBar.Bar>
        <ButtonBar.Button to={url.endsWith(query) ? '../' : './'}>
          <FormattedMessage id='CANCEL' />
        </ButtonBar.Button>
      </ButtonBar.Bar>}
    </form>
  )
}
