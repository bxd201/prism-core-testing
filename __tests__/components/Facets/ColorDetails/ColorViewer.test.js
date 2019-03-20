import React from 'react'
import { shallow } from 'enzyme'
import ColorViewer from 'src/components/Facets/ColorDetails/ColorViewer' 
import * as Colors from '__mocks__/data/color/Colors'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'

const color = Colors.getColor()
const BASE_CLASS = 'color-info'

const getColorViewer = (props) => {
    return shallow(<ColorViewer {...props} />)
}

describe('ColorViewer component without data', () => {
    let colorViewer
    beforeEach(() => {
        if(!colorViewer) {
            colorViewer = getColorViewer({color: []})
        }
    })

    it('ColorViewer Snapshot without data', () => {
        expect(colorViewer).toMatchSnapshot()
    })

    it('ColorViewer is rendering', () => {
        expect(colorViewer.exists).toBeTruthy()
    })

    it('ColorViewer is rendering empty span for number and name', () => {
        colorViewer.find('div > h1 > span').forEach((node) => {
            expect(node.text()).toEqual('')
        })
    })

    it('ColorViewer is rendering empty h2 for type', () => {
        expect(colorViewer.find('h2').text()).toEqual('')
    })
})

describe('ColorViewer component with data', () => {
    let colorViewer
    beforeEach(() => {
        if(!colorViewer) {
            colorViewer = getColorViewer({color: color})
        }
    })

    it('ColorViewer Snapshot with data', () => {
        expect(colorViewer).toMatchSnapshot()
    })

    it('ColorViewer is rendering', () => {
        expect(colorViewer.exists).toBeTruthy()
    })

    it('ColorViewer is rendering color number', () => {
        const colorNumberSpan = `div.${BASE_CLASS}__expanded-title h1.${BASE_CLASS}__name-number span.${BASE_CLASS}__number`
        const colorNumber = fullColorNumber(color.brandKey, color.colorNumber)
        expect(colorViewer.find(colorNumberSpan).contains(colorNumber)).toBeTruthy()
    })

    it('ColorViewer is rendering color name', () => {
        const colorNameSpan = `div.${BASE_CLASS}__expanded-title h1.${BASE_CLASS}__name-number span.${BASE_CLASS}__name`
        expect(colorViewer.find(colorNameSpan).contains(color.name)).toBeTruthy()
    })

    it('ColorViewer is rendering rack location', () => {
        const rackLocationHeader = `div.${BASE_CLASS}__expanded-title h3`
        expect(colorViewer.find(rackLocationHeader).contains(color.storeStripLocator))
    })
})