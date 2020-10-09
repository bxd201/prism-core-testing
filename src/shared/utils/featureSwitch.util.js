// @flow
import { FEATURE_EXCLUSIONS } from '../../constants/configurations'

export const shouldAllowFeature = (featureExclusions, feature) => {
  // uncomment line below to debug
  // @hack @todo COMMENT OUT BEFORE DEPLOY!!!!!!!!! -RS
  if (FEATURE_EXCLUSIONS.fastMask === feature) return false
  if (!featureExclusions) {
    return true
  }

  return featureExclusions.indexOf(feature) === -1
}

// @todo This validator allows us to understand the configuration rules and get ahead of configuration problems. This really needs a better home... -RS
export const featureExclusionsConfigIsValid = (featureExclusions) => {
  let violations = []

  if (featureExclusions.indexOf(FEATURE_EXCLUSIONS.editPhotos) > -1 && featureExclusions.indexOf(FEATURE_EXCLUSIONS.fastMask) > -1) {
    violations.push(`${FEATURE_EXCLUSIONS.fastMask} and ${FEATURE_EXCLUSIONS.editPhotos} are not allowed together.`)
  }

  if (featureExclusions.indexOf(FEATURE_EXCLUSIONS.editPhotos) === -1 && featureExclusions.indexOf(FEATURE_EXCLUSIONS.fastMask) === -1) {
    violations.push(`${FEATURE_EXCLUSIONS.fastMask} or ${FEATURE_EXCLUSIONS.editPhotos} must be specified to prevent double trouble (both being presented) display error.`)
  }

  if (featureExclusions.indexOf(FEATURE_EXCLUSIONS.inspirationalPhotos) > -1 &&
    featureExclusions.indexOf(FEATURE_EXCLUSIONS.expertColorPicks) > -1 &&
    featureExclusions.indexOf(FEATURE_EXCLUSIONS.paintedPhotos) > -1) {
    violations.push(`${FEATURE_EXCLUSIONS.inspirationalPhotos}, ${FEATURE_EXCLUSIONS.expertColorPicks} and ${FEATURE_EXCLUSIONS.paintedPhotos} creates an empty get inspired feature. 
    To disable all of these features remove the individual values and specify "getInspired" in the configuration.`)
  }

  if (featureExclusions.indexOf(FEATURE_EXCLUSIONS.exploreColors) > -1 &&
    featureExclusions.indexOf(FEATURE_EXCLUSIONS.getInspired) > -1 &&
    featureExclusions.indexOf(FEATURE_EXCLUSIONS.paintAPhoto) > -1) {
    violations.push(`${FEATURE_EXCLUSIONS.exploreColors}, ${FEATURE_EXCLUSIONS.getInspired} and ${FEATURE_EXCLUSIONS.paintAPhoto} cannot all be specified together. This creates empty navigation.`)
  }

  if (featureExclusions.indexOf(FEATURE_EXCLUSIONS.colorWall) > -1 &&
    featureExclusions.indexOf(FEATURE_EXCLUSIONS.colorCollections) > -1 &&
    featureExclusions.indexOf(FEATURE_EXCLUSIONS.matchAPhoto) > -1) {
    violations.push(`${FEATURE_EXCLUSIONS.colorWall}, ${FEATURE_EXCLUSIONS.colorCollections} and ${FEATURE_EXCLUSIONS.matchAPhoto} cannot all be specified together. This creates an empty Explore Colors feature. To disable explore Colors, only specify "exploreColors"`)
  }

  if (featureExclusions.indexOf(FEATURE_EXCLUSIONS.useOurPhotos) === -1 && featureExclusions.indexOf(FEATURE_EXCLUSIONS.uploadYourPhoto) === -1) {
    violations.push(`${FEATURE_EXCLUSIONS.useOurPhotos} and ${FEATURE_EXCLUSIONS.uploadYourPhoto} cannot both be specified together. This creates an empty Paint a Photo feature. To disable Paint a Photo only specify "paintAPhoto".`)
  }

  if (violations.length > 0) {
    return violations.join('\n')
  }

  return ''
}
