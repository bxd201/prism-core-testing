import React, { Link, useEffect, useState } from 'react'
import { addons, types } from '@storybook/addons'
import { useStorybookState } from '@storybook/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faClipboardList, faMinus, faTimes } from '@fortawesome/pro-solid-svg-icons'
import { faStopwatch } from '@fortawesome/pro-regular-svg-icons'
import './register.css'

const ADDON_ID = 'testaddon'
const TAB_ID = `${ADDON_ID}/panel`

const convertMsToS = (number) => (number >= 1000 ? `${(number / 1000).toFixed(1)}s` : `${number}ms`)

const TestRows = ({ suite, className }) => {
  const testState = {
    passed: { className: 'passed', icon: faCheck },
    failed: { className: 'failed', icon: faTimes },
    pending: { className: 'pending', icon: faMinus }
  }

  return (
    <ul>
      {suite.tests.map((test) => (
        <li className={`row ${className} ${test.state === 'failed' ? 'wrapped' : ''}`} key={test.uuid}>
          <div className='cell'>
            <FontAwesomeIcon icon={testState[test.state].icon} className={`icon ${testState[test.state].className}`} />
            <p className='title'>{test.title}</p>
          </div>
          <div className='cell'>
            <p>{convertMsToS(test.duration)}</p>
            <FontAwesomeIcon icon={faStopwatch} className='icon' />
          </div>
          {test.state === 'failed' && (
            <div className='cell last-cell'>
              <p className='error'>{test.err.message}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

const TestTab = () => {
  const sbState = useStorybookState()
  const [testData, setTestData] = useState(null)
  const component = sbState.storyId?.split('-').shift()
  const componentTest = testData?.results.filter((result) => result.suites[0].title.toLowerCase() === component)

  useEffect(() => {
    fetch('static/test-report.json')
      .then((response) => response.json())
      .then((data) => setTestData(data))
      .catch((error) => setTestData(null))
  }, [sbState])

  const contextElementsSum = (suite, el, isArray) =>
    suite.suites.length > 0
      ? suite.suites.map((context) => (isArray ? context[el].length : context[el])).reduce((prev, next) => prev + next)
      : 0

  return !testData || componentTest.length === 0 ? (
    <div className='row'>
      <p>
        no test available for this component
        {process.env.NODE_ENV !== 'production' && (
          <span>
            &nbsp;or report not generated, run<span className='npm'>npm run testtab</span>
          </span>
        )}
      </p>
    </div>
  ) : (
    componentTest.map((result) =>
      result.suites.map((suite) => (
        <div key={suite.uuid}>
          <video className='video' style={sbState.viewMode !== 'test' ? { zIndex: -1 } : {}} controls>
            <source src={`static/media/videos/${suite.title}/${suite.title}.spec.js.mp4`} type='video/mp4' />
            Your browser does not support HTML5 video.
          </video>
          <div className='row'>
            <h4 className='title'>{suite.title}</h4>
            <span className='status'>
              <FontAwesomeIcon icon={faStopwatch} className='icon' title='Tests duration' />
              <p className='title'>{convertMsToS(suite.duration + contextElementsSum(suite, 'duration'))}</p>
              <FontAwesomeIcon icon={faClipboardList} className='icon' title='Tests' />
              <p className='title'>{suite.tests.length + contextElementsSum(suite, 'tests', true)}</p>
              <FontAwesomeIcon icon={faCheck} className='icon passed' title='Tests passed' />
              <p className='title'>{suite.passes.length + contextElementsSum(suite, 'passes', true)}</p>
              {suite.pending.length > 0 && (
                <>
                  <FontAwesomeIcon icon={faMinus} className='icon pending' title='Tests pending' />
                  <p className='title'>{suite.pending.length + contextElementsSum(suite, 'pending', true)}</p>
                </>
              )}
              {suite.failures.length > 0 && (
                <>
                  <FontAwesomeIcon icon={faTimes} className='icon failed' title='Tests failed' />
                  <p className='title'>{suite.failures.length + contextElementsSum(suite, 'failures', true)}</p>
                </>
              )}
            </span>
          </div>
          <TestRows suite={suite} />
          {suite.suites.map((context) => (
            <div key={context.uuid}>
              <div className='row subtitle'>
                <h4 className='title'>{context.title}</h4>
              </div>
              <TestRows suite={context} className='context' />
            </div>
          ))}
        </div>
      ))
    )
  )
}

addons.register(ADDON_ID, (api) => {
  addons.add(TAB_ID, {
    type: types.TAB,
    title: 'Test',
    route: ({ storyId }) => `/test/${storyId}`,
    match: ({ viewMode }) => viewMode === 'test',
    render: () => <TestTab />
  })
})
