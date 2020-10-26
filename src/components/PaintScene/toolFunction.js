// @flow
import { copyImageList, getColorAtPixel, getSelectArea,
  edgeDetect, getActiveColorRGB, hexToRGB,
  floodFillScanLineStack, drawImagePixelByPath, getImageCordinateByPixel,
  eraseIntersection, getPaintAreaPath, updateDeleteAreaList, createPolygon,
  repaintCircleLine, drawLine, getCanvasWrapperOffset, dropPin, repaintImageByPath,
  filterErasePath, breakGroupIfhasIntersection, drawPaintBrushPoint, drawPaintBrushPathUsingLine,
  canvasDimensionFactors, applyDimensionFactorsToCanvas, pointInsideCircle
} from './utils'
import { toolNames } from './data'
import remove from 'lodash/remove'
import { checkUndoIsEnabled } from './UndoRedoUtil'
import uniqueId from 'lodash/uniqueId'

const baseClass = 'paint__scene__wrapper'
const canvasClass = `${baseClass}__canvas`

export const bucketPaint = (e, state, props, ref) => {
  const { CFICanvas2, canvasOriginalDimensions, CFICanvasContext2, mergeCanvasRef, canvasOffsetWidth, canvasOffsetHeight } = ref
  const { imagePathList } = state
  const { lpActiveColor } = props

  const { clientX, clientY } = e
  const canvasClientOffset = CFICanvas2.current.getBoundingClientRect()
  const scale = canvasOriginalDimensions.width / canvasClientOffset.width
  const cursorX = Math.round((clientX - canvasClientOffset.left) * scale)
  const cursorY = Math.round((clientY - canvasClientOffset.top) * scale)
  const mergeContext = mergeCanvasRef.current.getContext('2d')
  const imageData = mergeContext.getImageData(0, 0, mergeContext.canvas.width, mergeContext.canvas.height)

  let copyImagePathList = copyImageList(imagePathList)
  const RGB = getActiveColorRGB(hexToRGB(lpActiveColor.hex))
  const ctx = CFICanvas2.current.getContext('2d')
  const performance = window.performance.now()
  const imagePath = floodFillScanLineStack(imageData, RGB, cursorX, cursorY, 94, performance)
  CFICanvasContext2.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  drawImagePixelByPath(ctx, canvasOffsetWidth, canvasOffsetHeight, RGB, imagePath)
  const [pixelArray, pixelIndexAlphaMap] = getImageCordinateByPixel(CFICanvas2, RGB, canvasOffsetWidth, canvasOffsetHeight, true)
  // @todo [IMRPOVEMENT]- candidate for createImagePath factory -RS
  copyImagePathList.push({
    type: 'paint',
    id: uniqueId(),
    color: RGB,
    colorRef: { ...lpActiveColor },
    data: pixelArray,
    pixelIndexAlphaMap: pixelIndexAlphaMap,
    isEnabled: true,
    linkedOperation: null,
    siblingOperations: null })
  return {
    imagePathList: copyImagePathList,
    undoIsEnabled: checkUndoIsEnabled(copyImagePathList),
    redoIsEnabled: false,
    mergeCanvasKey: `${Date.now()}`
  }
}

export const selectArea = (e, state, ref) => {
  const { imagePathList, selectedArea, groupAreaList, groupSelectList } = state
  const { CFICanvas2, canvasOriginalDimensions, CFICanvasContext2, canvasOffsetWidth, canvasOffsetHeight } = ref
  const canvasClientOffset = CFICanvas2.current.getBoundingClientRect()
  const scale = canvasOriginalDimensions.width / canvasClientOffset.width
  const { clientX, clientY } = e
  const cursorX = parseInt((clientX - canvasClientOffset.left) * scale)
  const cursorY = parseInt((clientY - canvasClientOffset.top) * scale)
  const imageData = CFICanvasContext2.getImageData(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  let newImagePathList = copyImageList(imagePathList)
  const index = (cursorX + cursorY * canvasOffsetWidth) * 4
  let isClickInsideImage = false
  let isClickGroupArea = false

  const { r, g, b, a } = getColorAtPixel(imageData, cursorX, cursorY)
  if (r === 0 && g === 0 && b === 0 && a === 0) {
    return
  } else {
    isClickInsideImage = true
  }

  if (isClickInsideImage) {
    let tmpEdgeArea
    let tmpSelectPath
    let tmpId
    let ancestorId
    let tmplinkGroupId
    for (let i = 0; i < groupAreaList.length; i++) {
      if (groupAreaList[i].selectPath.includes(index)) {
        tmpSelectPath = groupAreaList[i].selectPath
        tmpEdgeArea = groupAreaList[i].edgeList
        tmpId = uniqueId()
        ancestorId = groupAreaList[i].id
        tmplinkGroupId = groupAreaList[i].linkGroupId
        isClickGroupArea = true
        break
      }
    }
    if (isClickGroupArea) {
      let hasAdd = false
      for (let i = 0; i < groupSelectList.length; i++) {
        if (groupSelectList[i].selectPath.includes(index)) {
          let toggleSelectId = groupSelectList[i].id
          newImagePathList = newImagePathList.map((item) => item.id === toggleSelectId ? { ...item, isEnabled: false } : item)
          newImagePathList.push({
            type: 'unselect-group',
            data: groupSelectList[i].selectPath,
            color: [],
            id: uniqueId(),
            toggleSelectId: toggleSelectId,
            isEnabled: true,
            linkedOperation: null,
            siblingOperations: null })
          groupSelectList.splice(i, 1)
          tmpSelectPath = null
          tmpEdgeArea = null
          hasAdd = true
          break
        }
      }
      if (!hasAdd) {
        groupSelectList.push({
          selectPath: tmpSelectPath,
          edgeList: tmpEdgeArea,
          id: tmpId,
          ancestorId: ancestorId,
          linkGroupId: tmplinkGroupId
        })
        newImagePathList.push(
          { type: 'select-group',
            data: tmpEdgeArea,
            redoPath: tmpSelectPath,
            color: [255, 255, 255, 255],
            linkGroupId: tmplinkGroupId,
            id: tmpId,
            ancestorId: ancestorId,
            isEnabled: true,
            linkedOperation: null,
            siblingOperations: null })
      }
      return { groupSelectList, imagePathList: newImagePathList }
    }

    if (!isClickGroupArea) {
      if (selectedArea.length > 0) {
        let hasAdd = false
        let linkId
        for (let i = 0; i < selectedArea.length; i++) {
          if (selectedArea[i].selectPath.includes(index)) {
            linkId = selectedArea[i].id
            hasAdd = true
            newImagePathList = newImagePathList.map((item) => item.id === linkId ? { ...item, isEnabled: false } : item)
            newImagePathList.push({
              type: 'unselect',
              data: selectedArea[i].selectPath,
              color: [],
              id: uniqueId(),
              toggleSelectId: linkId,
              isEnabled: true,
              linkedOperation: null,
              siblingOperations: null })
            selectedArea.splice(i, 1)
            break
          }
        }

        if (!hasAdd) {
          const performance = window.performance.now()
          const imagePath = getSelectArea(imageData, { r: 255, g: 0, b: 0 }, cursorX, cursorY, 100, performance)
          const edge = edgeDetect(CFICanvas2, imagePath, [255, 0, 0, 255], canvasOffsetWidth, canvasOffsetHeight)
          const linkId = uniqueId()
          selectedArea.push({
            id: linkId,
            edgeList: edge,
            selectPath: imagePath
          })
          newImagePathList.push(
            { type: 'select',
              data: edge,
              redoPath: imagePath,
              color: [255, 255, 255, 255],
              id: linkId,
              isEnabled: true,
              linkedOperation: null,
              siblingOperations: null })
        }
        return { selectedArea,
          imagePathList: newImagePathList,
          undoIsEnabled: checkUndoIsEnabled(newImagePathList),
          redoPathList: [],
          redoIsEnabled: false
        }
      } else {
        const performance = window.performance.now()
        const imagePath = getSelectArea(imageData, { r: 255, g: 0, b: 0 }, cursorX, cursorY, 100, performance)
        const edge = edgeDetect(CFICanvas2, imagePath, [255, 0, 0, 255], canvasOffsetWidth, canvasOffsetHeight)
        const linkId = uniqueId()
        selectedArea.push({
          id: linkId,
          edgeList: edge,
          selectPath: imagePath
        })
        newImagePathList.push(
          { type: 'select',
            data: edge,
            redoPath: imagePath,
            color: [255, 255, 255, 255],
            id: linkId,
            isEnabled: true,
            linkedOperation: null,
            siblingOperations: null })
        return {
          selectedArea,
          imagePathList: newImagePathList,
          undoIsEnabled: checkUndoIsEnabled(newImagePathList),
          redoPathList: [],
          redoIsEnabled: false
        }
      }
    }
  }
}

export const group = (state) => {
  let newGroupSelectList = []
  const { selectedArea, groupSelectList, groupAreaList, imagePathList, groupIds } = state
  let copyImagePathList = copyImageList(imagePathList)
  let newImagePathList
  let newGroupIds = [...groupIds]
  let newGroupAreaList = [...groupAreaList]
  let groupAreaPath = []
  let groupEdgeList = []
  let linkGroupId = []
  selectedArea.forEach(selectArea => {
    const targetPath = selectArea.selectPath
    const edgeList = selectArea.edgeList
    const selectId = selectArea.id
    groupAreaPath = [...targetPath, ...groupAreaPath]
    groupEdgeList = [...edgeList, ...groupEdgeList]
    newGroupIds.push(selectId)
    linkGroupId.push(selectId)
  })

  if (groupSelectList.length > 0) {
    newImagePathList = copyImagePathList.map((history) => (history.type === 'select-group') ? { ...history, isEnabled: false } : history)

    for (let j = 0; j < groupSelectList.length; j++) {
      linkGroupId = [...linkGroupId.concat(groupSelectList[j].linkGroupId)]
      const targetPath = groupSelectList[j].selectPath
      const edgeList = groupSelectList[j].edgeList
      groupAreaPath = [...targetPath, ...groupAreaPath]
      groupEdgeList = [...edgeList, ...groupEdgeList]
      for (let index = 0; index < newGroupAreaList.length; index++) {
        if (newGroupAreaList[index].id === groupSelectList[j].ancestorId) {
          newGroupAreaList.splice(index, 1)
          index--
        }
      }
    }
  } else {
    newImagePathList = copyImageList(copyImagePathList)
  }

  if (groupAreaPath.length > 0) {
    const copySelectedArea = copyImageList(selectedArea)
    const copyGroupSelectList = copyImageList(groupSelectList)
    const ancestorId = uniqueId()
    newGroupAreaList.push({
      edgeList: groupEdgeList,
      selectPath: groupAreaPath,
      id: ancestorId,
      linkGroupId: linkGroupId
    })

    const id = uniqueId()
    newGroupSelectList.push({
      edgeList: groupEdgeList,
      selectPath: groupAreaPath,
      id: id,
      ancestorId: ancestorId,
      linkGroupId: linkGroupId
    })

    newImagePathList.push({
      type: 'select-group',
      subType: 'create-group',
      selectedArea: copySelectedArea,
      groupSelectList: copyGroupSelectList,
      groupAreaList: newGroupAreaList,
      data: groupEdgeList,
      redoPath: groupAreaPath,
      id: id,
      linkGroupId: linkGroupId,
      color: [255, 255, 255, 255],
      isEnabled: true,
      linkedOperation: null,
      ancestorId: ancestorId,
      siblingOperations: null
    })
  }

  return {
    groupAreaList: newGroupAreaList,
    groupSelectList: newGroupSelectList,
    selectedArea: [],
    isUngroup: true,
    groupIds: newGroupIds,
    imagePathList: newImagePathList
  }
}

export const ungroup = (state) => {
  const { groupSelectList, groupAreaList, imagePathList } = state
  let copyImagePathList = copyImageList(imagePathList)
  let newGroupIds = []
  let removedIds = []
  let newImagePathList
  const idsToUngroup = groupSelectList.map((item) => {
    return item.ancestorId
  })

  for (let i = 0; i < groupAreaList.length; i++) {
    const idToModify = groupAreaList[i].linkGroupId
    if (idsToUngroup.includes(groupAreaList[i].id)) {
      removedIds = [...removedIds.concat(idToModify)]
    } else {
      newGroupIds = [...newGroupIds.concat(idToModify)]
    }
  }

  const newGroupAreaList = groupAreaList.filter(item => {
    return (idsToUngroup.indexOf(item.id) === -1)
  })

  const unGroupedAreaList = groupAreaList.filter(area => idsToUngroup.includes(area.id))
  newImagePathList = copyImagePathList.map((history) => {
    if (history.type === 'select' && removedIds.includes(history.id)) {
      return { ...history, isEnabled: false }
    } else if (history.type === 'select-group') {
      return { ...history, isEnabled: false }
    } else {
      return history
    }
  })

  const getSelectAreaPathById = (ancestorId) => {
    for (let j = 0; j < groupSelectList.length; j++) {
      if (ancestorId === groupSelectList[j].ancestorId) {
        return groupSelectList[j]
      }
    }
    return []
  }

  unGroupedAreaList.forEach(area => {
    const id = uniqueId()
    const groupSelect = getSelectAreaPathById(area.id)
    newImagePathList.push({
      type: 'ungroup',
      data: [],
      redoPath: [],
      id: id,
      groupIds: area.linkGroupId,
      groupAreaList: area,
      groupSelectList: groupSelect,
      color: [255, 255, 255, 255],
      isEnabled: true,
      linkedOperation: null,
      ancestorId: groupSelect.id,
      siblingOperations: null
    })
  })

  return {
    groupAreaList: newGroupAreaList,
    groupSelectList: [],
    isUngroup: false,
    groupIds: newGroupIds,
    imagePathList: newImagePathList
  }
}

export const deleteGroup = (state) => {
  const { imagePathList, groupSelectList, selectedArea, groupIds, groupAreaList, deleteAreaList } = state
  let updateImagePathList = copyImageList(imagePathList)
  let newGroupIds = []

  selectedArea.forEach(selectArea => {
    const deletePath = [...selectArea.selectPath, ...selectArea.edgeList]
    const id = uniqueId()
    const linkId = selectArea.id
    updateImagePathList.push({
      type: 'delete',
      data: deletePath,
      redoPath: selectArea.selectPath,
      toggleSelectId: linkId,
      id: id,
      linkGroupId: null,
      color: [255, 255, 255, 0],
      isEnabled: true,
      linkedOperation: null,
      ancestorId: null,
      siblingOperations: null
    })
    deleteAreaList.push({
      id: id,
      data: deletePath
    })
  })

  const idsToUngroup = groupSelectList.map((groupSelect) => {
    const deletePath = [...groupSelect.selectPath, ...groupSelect.edgeList]
    const id = uniqueId()
    updateImagePathList.push({
      type: 'delete-group',
      data: [...groupSelect.selectPath, ...groupSelect.edgeList],
      redoPath: groupSelect.selectPath,
      id: uniqueId(),
      linkGroupId: null,
      color: [255, 255, 255, 0],
      groupSelectList: groupSelectList,
      groupAreaList: groupAreaList,
      groupIds: groupIds,
      isEnabled: true,
      linkedOperation: null,
      ancestorId: null,
      siblingOperations: null
    })
    deleteAreaList.push({
      id: id,
      data: deletePath
    })
    return groupSelect.ancestorId
  })

  const newGroupAreaList = groupAreaList.filter(item => {
    return (idsToUngroup.indexOf(item.id) === -1)
  })

  for (let i = 0; i < groupAreaList.length; i++) {
    const idToModify = groupAreaList[i].linkGroupId
    if (!idsToUngroup.includes(groupAreaList[i].id)) {
      newGroupIds = [...newGroupIds.concat(idToModify)]
    }
  }

  return {
    imagePathList: updateImagePathList,
    selectedArea: [],
    groupSelectList: [],
    groupAreaList: newGroupAreaList,
    deletAreaList: deleteAreaList,
    groupIds: newGroupIds }
}

export const createOrDeletePolygon = (isAddArea, state, props, ref) => {
  const { polyList, imagePathList, deleteAreaList } = state
  const { lpActiveColor } = props
  const { CFICanvasContext4, canvasOffsetWidth, canvasOffsetHeight, CFICanvasPaint, CFICanvasContextPaint } = ref
  CFICanvasContext4.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  let tmpImagePathList
  let newImagePathList
  let newDeleteAreaList = copyImageList(deleteAreaList)
  CFICanvasContextPaint.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  createPolygon(polyList, CFICanvasPaint, canvasOffsetWidth, canvasOffsetHeight, lpActiveColor.hex, 'source-over')
  if (!isAddArea) {
    const RGB = getActiveColorRGB(hexToRGB(lpActiveColor.hex))
    const erasePath = getImageCordinateByPixel(CFICanvasPaint, RGB, canvasOffsetWidth, canvasOffsetHeight, false)
    CFICanvasContextPaint.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
    tmpImagePathList = eraseIntersection(imagePathList, erasePath)
    newImagePathList = remove(tmpImagePathList, (currImagePath) => {
      return currImagePath.data.length !== 0
    })
  } else {
    const paintData = getPaintAreaPath(imagePathList, CFICanvasPaint, canvasOffsetWidth, canvasOffsetHeight, lpActiveColor)
    newImagePathList = paintData.newImagePathList
    const paintPath = paintData.paintPath
    newDeleteAreaList = updateDeleteAreaList(paintPath, deleteAreaList)
    CFICanvasContextPaint.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  }

  return {
    polyList: [],
    presentPolyList: [],
    lineStart: [],
    BeginPointList: [],
    imagePathList: newImagePathList,
    deleteAreaList: newDeleteAreaList,
    showAnimatePin: false,
    showNonAnimatePin: false,
    undoIsEnabled: checkUndoIsEnabled(newImagePathList)
  }
}

export const createPolygonPin = (e, state, props, ref, coordinate, pointList) => {
  const { clientX, clientY } = e
  const { BeginPointList, lineStart } = state
  const { CFICanvas4, CFICanvasContextPaint, CFICanvasContext4, canvasOffsetWidth, canvasOffsetHeight, CFIWrapper } = ref
  let ctxDraw = CFICanvas4.current.getContext('2d')
  CFICanvasContextPaint.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  CFICanvasContext4.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  pointList.length > 2 && repaintCircleLine(ctxDraw, BeginPointList, pointList.slice(1, -1))
  const canvasWrapperOffset = getCanvasWrapperOffset(CFIWrapper)
  const leftOffset = clientX - canvasWrapperOffset.x
  const topOffset = clientY - canvasWrapperOffset.y
  let newState = dropPin(leftOffset, topOffset, BeginPointList.length > 0)
  if (lineStart.length > 0) {
    ctxDraw.beginPath()
    const end = [...coordinate]
    drawLine(ctxDraw, lineStart, end, true)
    ctxDraw.restore()
    return newState
  } else {
    return { BeginPointList: [...coordinate], ...newState }
  }
}

export const eraseOrPaintMouseUp = (state, props, ref) => {
  const { prevPoint, imagePathList, activeTool, deleteAreaList } = state
  const { lpActiveColor } = props
  const { CFICanvasPaint, CFICanvas2, canvasOffsetWidth, canvasOffsetHeight, CFICanvasContextPaint } = ref
  let newDeleteAreaList = copyImageList(deleteAreaList)
  let paintPath = []

  if ((props.lpActiveColor === null || (props.lpActiveColor.constructor === Object && Object.keys(props.lpActiveColor).length === 0)) && activeTool === toolNames.PAINTBRUSH) {
    return {
      isDragging: false
    }
  }
  let newImagePathList
  const { newGroupSelectList, newGroupAreaList } = breakGroupIfhasIntersection(state, ref)
  if (lpActiveColor && activeTool === toolNames.PAINTBRUSH && prevPoint !== null) {
    const paintData = getPaintAreaPath(imagePathList, CFICanvasPaint, canvasOffsetWidth, canvasOffsetHeight, lpActiveColor)
    newImagePathList = paintData.newImagePathList
    paintPath = paintData.paintPath
    newDeleteAreaList = updateDeleteAreaList(paintPath, deleteAreaList)
    repaintImageByPath(newImagePathList, CFICanvas2, canvasOffsetWidth, canvasOffsetHeight, false)
  }

  if (activeTool === toolNames.ERASE && prevPoint !== null) {
    const RGB = getActiveColorRGB({ red: 255, blue: 255, green: 255 })
    const erasePathWithAlpha = getImageCordinateByPixel(CFICanvasPaint, RGB, canvasOffsetWidth, canvasOffsetHeight, true)
    let erasePath = []
    Object.keys(erasePathWithAlpha[1]).forEach(key => {
      if (erasePathWithAlpha[1][key] > 126) {
        erasePath.push(parseInt(key))
      }
    })
    const updateErasePath = filterErasePath(erasePath, deleteAreaList)
    const tmpImagePathList = eraseIntersection(imagePathList, updateErasePath)
    newImagePathList = remove(tmpImagePathList, (currImagePath) => {
      return currImagePath.data.length !== 0
    })
    repaintImageByPath(newImagePathList, CFICanvas2, canvasOffsetWidth, canvasOffsetHeight, true)
  }
  CFICanvasContextPaint.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  return { isDragging: false,
    imagePathList: newImagePathList,
    groupAreaList: newGroupAreaList,
    deletAreaList: newDeleteAreaList,
    groupSelectList: newGroupSelectList,
    redoPathList: [],
    undoIsEnabled: checkUndoIsEnabled(newImagePathList),
    redoIsEnabled: false,
    mergeCanvasKey: Date.now()
  }
}

export const eraseOrPaintMouseDown = (e, state, props, ref) => {
  const { isDragging, paintBrushWidth, paintBrushShape, activeTool } = state
  const { lpActiveColor } = props
  const { CFICanvas2, canvasOriginalDimensions, CFICanvasContextPaint } = ref
  if ((lpActiveColor === null || (lpActiveColor.constructor === Object && Object.keys(lpActiveColor).length === 0)) && activeTool === toolNames.PAINTBRUSH) return
  const lpActiveColorRGB = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
  const { clientX, clientY } = e
  const canvasClientOffset = CFICanvas2.current.getBoundingClientRect()
  const scale = canvasOriginalDimensions.width / canvasClientOffset.width
  const currentPoint = {
    x: (clientX - canvasClientOffset.left) * scale,
    y: (clientY - canvasClientOffset.top) * scale
  }
  const lastPoint = { x: currentPoint.x - 1, y: currentPoint.y }
  CFICanvasContextPaint.beginPath()
  if (isDragging === false) {
    if ((activeTool === toolNames.PAINTBRUSH) || (activeTool === toolNames.ERASE)) {
      drawPaintBrushPoint(currentPoint, null, state, props, ref)
    } else {
      if (activeTool === toolNames.PAINTBRUSH) {
        drawPaintBrushPathUsingLine(CFICanvasContextPaint, currentPoint, lastPoint, paintBrushWidth, paintBrushShape, false, lpActiveColorRGB, ref)
      }
    }
  }
  return currentPoint
}

export const applyZoom = (zoomNumber, ref) => {
  const { wrapperOriginalDimensions, canvasOriginalDimensions, canvasPanStart, canvasDisplayWidth, canvasDisplayHeight } = ref
  const options = {
    containerWidth: wrapperOriginalDimensions.width,
    containerHeight: wrapperOriginalDimensions.height,
    canvasWidth: canvasOriginalDimensions.width,
    canvasHeight: canvasOriginalDimensions.height,
    zoom: zoomNumber,
    panX: canvasPanStart.x,
    panY: canvasPanStart.y,
    canvasDisplayWidth,
    canvasDisplayHeight
  }

  const factors = canvasDimensionFactors(options)
  applyDimensionFactorsToCanvas(factors, ref)
}

export const getActiveToolState = (state: Object, ref: Object, paintSceneMethod: Function, activeTool: string) => {
  const { imagePathList } = state
  let newImagePathList = copyImageList(imagePathList)

  const updateState = {
    paintCursor: `${canvasClass}--${activeTool}`,
    lineStart: [],
    BeginPointList: [],
    polyList: [],
    presentPolyList: [],
    showAnimatePin: false,
    showNonAnimatePin: false
  }

  if (activeTool === '') {
    return ({
      ...updateState,
      isInfoToolActive: false,
      paintCursor: `${canvasClass}--${state.activeTool}`
    })
  }
  if (activeTool === state.activeTool) {
    return updateState
  }
  if (activeTool === toolNames.INFO) {
    return ({ ...updateState, isInfoToolActive: true })
  }
  if (activeTool !== toolNames.UNDO || activeTool !== toolNames.REDO) {
    newImagePathList = newImagePathList.filter(item => { return (item.type === 'paint' || item.type === 'delete' || item.type === 'delete-group') })
  }
  paintSceneMethod()
  repaintImageByPath(newImagePathList, ref.CFICanvas2, ref.canvasOffsetWidth, ref.canvasOffsetHeight, false, [], true)
  return ({ ...updateState, activeTool, selectedArea: [], canvasImageUrls: getLayers(ref), imagePathList: newImagePathList })
}

export const getLayers = (ref: Object) => {
  if (!ref.CFICanvas.current || !ref.CFICanvas2.current) {
    return []
  }
  const imageUrls = [ref.CFICanvas.current.toDataURL(), ref.CFICanvas2.current.toDataURL()]
  return imageUrls
}

export const getBrushShapeSize = (brushShape: string, brushWidth: number, state: Object) => {
  const { activeTool } = state

  switch (activeTool) {
    case toolNames.PAINTBRUSH:
      return {
        paintBrushShape: brushShape,
        paintBrushWidth: brushWidth
      }
    case toolNames.ERASE:
      return {
        eraseBrushShape: brushShape,
        eraseBrushWidth: brushWidth
      }
    default:
      break
  }
}

export const getActiveGroupTool = (state: Object) => {
  const { selectedArea, groupSelectList } = state
  let isDeleteGroup = false
  let isAddGroup = false
  let isUngroup = false
  if (selectedArea.length > 0 || groupSelectList.length > 0) { isDeleteGroup = true }
  if (selectedArea.length > 1 || (selectedArea.length > 0 && groupSelectList.length > 0) || (groupSelectList.length > 1)) { isAddGroup = true }
  if (groupSelectList.length > 0) { isUngroup = true }
  return { isDeleteGroup: isDeleteGroup, isAddGroup: isAddGroup, isUngroup: isUngroup }
}

export const panMove = (event, state, ref, context) => {
  let { canvasOriginalDimensions, wrapperOriginalDimensions } = ref
  const { canvasZoom, canvasMouseDown } = state
  if (canvasZoom <= 1 || canvasZoom >= 8) return
  if (!canvasMouseDown) return
  const MIN_PAN = -0.1
  const MAX_PAN = 1.1
  const { body }: Object = document
  const { clientWidth, clientHeight } = body
  const dx = (event.pageX - context.lastPanPoint.x) / clientWidth
  const dy = (event.pageY - context.lastPanPoint.y) / clientHeight
  const panX = context.canvasPanStart.x - dx
  const panY = context.canvasPanStart.y - dy
  context.canvasPanStart = { x: Math.max(MIN_PAN, Math.min(MAX_PAN, panX)), y: Math.max(MIN_PAN, Math.min(MAX_PAN, panY)) }
  context.lastPanPoint = { x: event.pageX, y: event.pageY }
  const options = {
    containerWidth: wrapperOriginalDimensions.width,
    containerHeight: wrapperOriginalDimensions.height,
    canvasWidth: canvasOriginalDimensions.width,
    canvasHeight: canvasOriginalDimensions.height,
    zoom: canvasZoom,
    panX: context.canvasPanStart.x,
    panY: context.canvasPanStart.y
  }
  const factors = canvasDimensionFactors(options)
  applyDimensionFactorsToCanvas(factors, ref)
}

export const getDefinedPolygon = (e, state, props, ref, isAddArea, clearCanvasCallback) => {
  const { BeginPointList, polyList, presentPolyList } = state
  const { CFICanvas2, CFICanvas4, canvasOriginalDimensions, CFICanvasContext4, canvasOffsetWidth, canvasOffsetHeight } = ref
  const { clientX, clientY } = e
  const canvasClientOffset = CFICanvas2.current.getBoundingClientRect()
  const canvasClientOffset4 = CFICanvas4.current.getBoundingClientRect()
  const scale = canvasOriginalDimensions.width / canvasClientOffset.width
  const cursorX = (clientX - canvasClientOffset.left) * scale
  const cursorY = (clientY - canvasClientOffset.top) * scale
  const X = clientX - canvasClientOffset4.left
  const Y = clientY - canvasClientOffset4.top
  const poly = [...polyList]
  const presentPoly = [...presentPolyList]
  poly.push([cursorX, cursorY])
  presentPoly.push([X, Y])

  let isBackToStart = false
  if (BeginPointList.length > 0) {
    isBackToStart = pointInsideCircle(X, Y, BeginPointList, 10)
  }
  if (isBackToStart) {
    clearCanvasCallback()
    let newState = createOrDeletePolygon(isAddArea, state, props, ref)
    clearCanvasCallback()
    CFICanvasContext4.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
    repaintImageByPath(newState.imagePathList, CFICanvas2, canvasOffsetWidth, canvasOffsetHeight)
    return newState
  } else {
    let newState = createPolygonPin(e, state, props, ref, [X, Y], presentPoly)
    return { ...newState,
      lineStart: [X, Y],
      polyList: poly,
      presentPolyList: presentPoly
    }
  }
}

export const getEmptyCanvas = (state, ref, clearCanvasDrawing) => {
  const { imagePathList } = state
  const undolist = copyImageList(imagePathList)
  const { CFICanvasContext2, canvasOffsetWidth, canvasOffsetHeight } = ref
  CFICanvasContext2.clearRect(0, 0, canvasOffsetWidth, canvasOffsetHeight)
  if (clearCanvasDrawing) {
    return {
      imagePathList: [],
      selectedArea: [],
      clearUndoList: undolist,
      redoPathList: [],
      redoIsEnabled: false
    }
  }
}

export const handleMouseMove = (e, state, props, ref) => {
  const { clientX, clientY } = e
  const { paintCursorRef, CFICanvasContextPaint, CFICanvas2, canvasOriginalDimensions } = ref
  const { activeTool, paintBrushWidth, isDragging, paintBrushShape, prevPoint } = state
  const { lpActiveColor } = props
  const canvasClientOffset = CFICanvas2.current.getBoundingClientRect()
  paintCursorRef.current && ref.paintCursorRef.current.handleMouseMove(clientX, clientY)
  if ((lpActiveColor === null || (lpActiveColor.constructor === Object && Object.keys(lpActiveColor).length === 0)) && activeTool === toolNames.PAINTBRUSH) return
  if ((lpActiveColor && activeTool === toolNames.PAINTBRUSH) || activeTool === toolNames.ERASE) {
    const lpActiveColorRGB = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
    const scale = canvasOriginalDimensions.width / Math.ceil(canvasClientOffset.width)
    if (isDragging) {
      const currentPoint = {
        x: (clientX - canvasClientOffset.left) * scale,
        y: (clientY - canvasClientOffset.top) * scale
      }
      if ((activeTool === toolNames.PAINTBRUSH) || (activeTool === toolNames.ERASE)) {
        drawPaintBrushPoint(currentPoint, prevPoint, state, props, ref)
      } else {
        CFICanvasContextPaint.beginPath()
        if (activeTool === toolNames.PAINTBRUSH) {
          drawPaintBrushPathUsingLine(CFICanvasContextPaint, currentPoint, prevPoint, paintBrushWidth, paintBrushShape, false, lpActiveColorRGB)
        }
      }
      return { prevPoint: currentPoint }
    }
  }
}
