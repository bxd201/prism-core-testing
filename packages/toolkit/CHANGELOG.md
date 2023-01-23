# @prism/toolkit

## 5.1.0

### Minor Changes

- f13d595d: Migrated lowes qr code color wall to v3 [DCT-674]
- 7f718f4b: Added pager position on Carousel and ColorCollections [MESP-7711]
- f372f1f7: DCT-514: Allow duplicate colors to exist on the ColorWall

### Patch Changes

- f4a49424: Rerender ColorWall when swatch renderers change [DCT-749]
- 414aa9a7: Fix data-testid attributes in some components

## 5.0.0

### Major Changes

- 384bd271: updated ColorWall API to promote composability [DCT-438]

## 4.2.0

## 4.1.0

### Patch Changes

- 596c23ad: Fixed an issue where the zoom button was being overlapped by a blooming swatch. [DCT-521]
- 09dc67e3: Fixed an issue where the View Details font size was too small. [DCT-552]
- 7dce5377: Label color pin buttons using existing label area [DCT-586]
- d3dcae2b: Fixed an issue where the search result container had no height. This also will fix the EDE disclaimer being too high up on the page. [DCT-530]
- a3887c88: Fixed an issue where cancel button and input styling were incorrect. [DCT-524]

## 4.0.0

### Minor Changes

- 3f305020: Smoothed infinity transaction delay [DCT-423][dct-424]

### Patch Changes

- 446fc9ee: Move ColorSwatch label to button
- c94eb433: Fix text/icon overlap in LivePallete

## 3.5.0

### Minor Changes

- 7ad08e8c: Fixes all imports order or remove unused imports [DCT-XX]
- 14a91af7: Updated Toolbar and ColorWall stories in toolkit. [DCT-73]

### Patch Changes

- 14a91af7: Fixed a bug in ColorWallToolbar where the Color Families button would disappear instead of being disabled. [DCT-236]

## 3.4.0

### Minor Changes

- 9933270a: Adjusts the size of the inner color chip to acomodate larger content [MESP-6343]
- 7acefe1c: Migrated Toolbar minimal UI from Facets to Toolkit. [DCT-415]
- 85b287f1: adding subscribed event to ColorWall facet to allow activating a color [DCT-448]
- b828c038: Fixing title spacing in wrapped view [DCT-323]
- 0afd6b0b: Interpret hideOnWrapped for shape titles [DCT-323]

### Patch Changes

- 84acba56: Updating tests and fixing issue with rows and cols rendering 0 when no children [DCT-449]
- 8405b3ec: Fixed toolkit external build class prefixing [DCT-456]
- 9062c414: Translated CVW into Portuguese [DCT-426]
  Adjusted wall chunk section content alignment [DCT-426]
