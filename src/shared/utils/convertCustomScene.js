/**
 * Converts data from legacy SW API into new data structure.
 *
 * The customScene is expected to be the data that comes from the endpoint:
 * https://www.sherwin-williams.com/color-visualization/services/scene/custom
 *
 * The colors is expected to be the data that comes from the endpoint:
 * https://www.sherwin-williams.com/color-visualization/services/color/SW/all
 *
 * The paintedScenes is expected to be the data that comes from the endpoint:
 * https://www.sherwin-williams.com/color-visualization/services/scene/painted
 *
 * @param options Object with customScene, colors, paintedScenes
 * @returns convertedScene
 */
function convertCustomScene ({customScene, colors, paintedScenes}) {

    const paintedScene = paintedScenes.find(
        paintedScene => paintedScene.sceneDefinition.renderingBaseUrl === customScene.renderingBaseUrl
    );
    if (!paintedScene) {
        throw new Error('unable to find painted scene by rendering base url');
    }

    return {
        id: paintedScene.id,
        name: paintedScene.name,
        renderingBaseUrl: paintedScene.sceneDefinition.renderingBaseUrl,
        regions: convertRegions(customScene.regionsXml),
        palette: convertPalette({sceneColorPalette: paintedScene.sceneColorPalette, colors}),
    };
}

function convertPalette({sceneColorPalette, colors}) {

    const regionColorMap = sceneColorPalette.regionColorMap;
    let map = [];
    for (let regionName in regionColorMap) {
        const regionColor = regionColorMap[regionName];
        const color = colors.find(color => color.id === regionColor.id);
        if (!color) {
            throw new Error('unable to find associated color by id');
        }
        const colorNumber = 'SW' + color.colorNumber;
        map.push({
            name: regionName,
            color: colorNumber,
        })
    }
    return map;
}

function convertRegions(regionsXml) {
    const div = document.createElement('DIV');
    div.innerHTML = regionsXml;
    const project = div.querySelector('project');
    const width = parseInt(project.getAttribute('width'));
    const height = parseInt(project.getAttribute('height'));
    const surfaces = project.querySelectorAll('surface');
    let regions = [];
    for (let surface of surfaces) {
        const surfaceCategory = surface.getAttribute('category');
        const surfaceRegion = surface.getAttribute('region');
        const regionName = surfaceCategory.toLowerCase() + '_' + surfaceRegion.toLowerCase();
        const surfaceMask = surface.querySelector('surfacemask');
        const regionMask = surfaceMask.getAttribute('string');
        regions.push({
            name: regionName,
            mask: regionMask,
            width,
            height,
        });
    }
    return regions;
}

module.exports = convertCustomScene;
