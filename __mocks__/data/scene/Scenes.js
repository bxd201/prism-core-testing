import cloneDeep from 'lodash/cloneDeep'
const Scenes =
[{ 'id': 1, 'width': 1311, 'height': 792, 'variant_names': ['day', 'night'], 'variants': [{ 'name': 'Living Room Day', 'variant_name': 'day', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.1 0.15 0.25 0.4 0.5 0.6 0.7 0.84 0.955 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/2/m1.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/2/m2.svg', 'role': 'main' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/2/m3.svg', 'role': 'trim' }] }, { 'name': 'Living Room Night', 'variant_name': 'night', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_night?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_night?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.1 0.22 0.32 0.42 0.51 0.6 0.7 0.84 0.955 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/2/m1.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/2/m2.svg', 'role': 'main' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/2/m3.svg', 'role': 'trim' }] }] }, { 'id': 2, 'width': 1311, 'height': 792, 'variant_names': ['day', 'night'], 'variants': [{ 'name': 'Kitchen Day', 'variant_name': 'day', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_day?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_day?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.15 0.3 0.45 0.55 0.7 0.8 0.85 0.92 0.95 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_day?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/4/1.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_day?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/4/2.svg', 'role': 'accent' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_day?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/4/3.svg', 'role': 'trim' }] }, { 'name': 'Kitchen Night', 'variant_name': 'night', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.15 0.27 0.38 0.49 0.59 0.69 0.8 0.92 0.955 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/4/1.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/4/2.svg', 'role': 'accent' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_kitchen6_night?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/4/3.svg', 'role': 'trim' }] }] }, { 'id': 3, 'width': 1311, 'height': 792, 'variant_names': ['day', 'night'], 'variants': [{ 'name': 'Bedroom Day', 'variant_name': 'day', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_day?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_day?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.1 0.2 0.31 0.42 0.54 0.64 0.76 0.9 0.92 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bedroom1/main.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bedroom1/accent.svg', 'role': 'main' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bedroom1/trim.svg', 'role': 'trim' }] }, { 'name': 'Bedroom Night', 'variant_name': 'night', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_night?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_night?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.15 0.24 0.33 0.42 0.54 0.64 0.76 0.9 0.92 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bedroom1/main.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bedroom1/accent.svg', 'role': 'main' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bedroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bedroom1/trim.svg', 'role': 'trim' }] }] }, { 'id': 4, 'width': 1311, 'height': 792, 'variant_names': ['day', 'night'], 'variants': [{ 'name': 'Bathroom Day', 'variant_name': 'day', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_day?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_day?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.13 0.23 0.33 0.44 0.545 0.645 0.765 0.86 0.93 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bathroom1/main.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bathroom1/accent.svg', 'role': 'main' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_day?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bathroom1/trim.svg', 'role': 'trim' }] }, { 'name': 'Bathroom Night', 'variant_name': 'night', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_night?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_night?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.14 0.24 0.335 0.44 0.545 0.645 0.765 0.86 0.93 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bathroom1/main.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bathroom1/accent.svg', 'role': 'main' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_bathroom6_night?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/bathroom1/trim.svg', 'role': 'trim' }] }] }, { 'id': 5, 'width': 1311, 'height': 792, 'variant_names': ['day', 'night'], 'variants': [{ 'name': 'Exterior House Day', 'variant_name': 'day', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_day?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_day?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.1 0.2 0.31 0.42 0.545 0.645 0.765 0.86 0.93 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_day?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/exterior1/main.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_day?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/exterior1/accent.svg', 'role': 'accent' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_day?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/exterior1/trim.svg', 'role': 'trim' }] }, { 'name': 'Exterior House Night', 'variant_name': 'night', 'image': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_night?wid=1311}&qlt=92', 'thumb': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_night?wid=300}&qlt=80', 'normalizedImageValueCurve': '0 0.1 0.2 0.31 0.42 0.545 0.645 0.765 0.86 0.93 1', 'surfaces': [{ 'id': 1, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_night?wid=1280&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/exterior1/main.svg', 'role': 'main' }, { 'id': 2, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_night?wid=1280&req=object&opac=100&fmt=png8&object=accent&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/exterior1/accent.svg', 'role': 'accent' }, { 'id': 3, 'mask': 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_exterior6_night?wid=1280&req=object&opac=100&fmt=png8&object=trim&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1', 'hitArea': '/prism/images/scenes/rooms/exterior1/trim.svg', 'role': 'trim' }] }] }]
const status = [
  {
    id: 1,
    variant: 'day',
    surfaces: [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ]
  },
  {
    id: 2,
    variant: 'day',
    surfaces: [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ]
  },
  {
    id: 3,
    variant: 'day',
    surfaces: [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ]
  },
  {
    id: 4,
    variant: 'day',
    surfaces: [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ]
  },
  {
    id: 5,
    variant: 'day',
    surfaces: [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ]
  }
]

export const sceneStatus = cloneDeep(status)
export const surfaces = cloneDeep(Scenes)
