import React from 'react'
import { shallow, mount } from 'enzyme'
import ColorInfo from 'src/components/Facets/ColorDetails/ColorInfo'
import * as Colors from '__mocks__/data/color/Colors'

const color = Colors.getColor()
let colors=[]

const colorInfo = (color)=>{
    return shallow(<ColorInfo color={color}/>)
}

describe('Color Info component with props as empty array',()=>{ 
    const mountedColorInfo = colorInfo([])

    it('snapshot testing',()=>{
        expect(mountedColorInfo).toMatchSnapshot();
    })

    it('component will be rendering',()=>{
       const colorInfoExist = mountedColorInfo.exists()
       expect(colorInfoExist).toEqual(true)
    })

    it('component will not rendering color info data inside of component',()=>{      
        mountedColorInfo.find('dd').forEach((el)=>{
            expect(el.text()==='').toEqual(true)
        })
    })
})

describe('Color Info component with props of colors',()=>{ 
    const mountedColorInfo = colorInfo(color)

    beforeEach(()=>{
        Object.keys(color).filter((el)=>{
             if(el==='red'||el==='green'||el==='blue'||el==='hex'){
                 colors.push(color[el].toString())
             }
        })
        colors.push(Math.round(color.lrv).toString())
        color.brandedCollectionNames && colors.push(color.brandedCollectionNames.join(', '))
    })

    it('snapshot testing',()=>{
        expect(mountedColorInfo).toMatchSnapshot();
    })

    it('component will be rendering',()=>{
       const colorInfoExist = mountedColorInfo.exists()
       expect(colorInfoExist).toEqual(true)
    })

    it('component will rendering color info data inside of component',()=>{      
        mountedColorInfo.find('dd').forEach((el)=>{
            const colorExist = colors.includes(el.text())
            expect(colorExist).toEqual(true)
        })
    })    
})
