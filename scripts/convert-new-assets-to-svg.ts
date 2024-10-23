import {
  vectorize,
  ColorMode,
  PathSimplifyMode,
  Hierarchical,
} from '@neplex/vectorizer'
import { glob } from 'glob'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'path'

import {
  PROTOCOLS_FOLDER,
  PROTOCOLS_NEW_FOLDER,
  PROTOCOLS_ORIGINAL_FOLDER,
  TOKENS_FOLDER,
  TOKENS_NEW_FOLDER,
  TOKENS_ORIGINAL_FOLDER,
} from './_/constants'

const convertAssetToSvg = async ({
  folder,
  image,
  originalFolder,
}: {
  folder: string
  image: string
  originalFolder: string
}) => {
  const src = await readFile(image)
  await writeFile(`${originalFolder}/${path.basename(image)}`, src)
  const svg = await vectorize(src, {
    // @ts-expect-error TS2748: Cannot access ambient const enums when isolatedModules is enabled
    colorMode: ColorMode.Color,
    colorPrecision: 6,
    cornerThreshold: 60,
    filterSpeckle: 4,
    // @ts-expect-error TS2748: Cannot access ambient const enums when isolatedModules is enabled
    hierarchical: Hierarchical.Stacked,
    layerDifference: 5,
    lengthThreshold: 5,
    maxIterations: 2,
    // @ts-expect-error TS2748: Cannot access ambient const enums when isolatedModules is enabled
    mode: PathSimplifyMode.Spline,
    pathPrecision: 5,
    spliceThreshold: 45,
  })

  await writeFile(
    `${folder}/${path.basename(image).replace('.png', '.svg')}`,
    svg,
  )
}

const convertFolder = async ({
  folder,
  newFolder,
  originalFolder,
}: {
  folder: string
  newFolder: string
  originalFolder: string
}) => {
  const pngs = await glob(`${newFolder}/*.png`)
  if (pngs.length > 0) {
    pngs.forEach((image) => {
      convertAssetToSvg({ folder, image, originalFolder })
    })
    console.log(`converted all pngs in ${newFolder}`)
  } else {
    console.log(`no pngs in ${newFolder}`)
  }
}

const convertNewAssetsToSvg = () => {
  convertFolder({
    folder: PROTOCOLS_FOLDER,
    newFolder: PROTOCOLS_NEW_FOLDER,
    originalFolder: PROTOCOLS_ORIGINAL_FOLDER,
  })
  convertFolder({
    folder: TOKENS_FOLDER,
    newFolder: TOKENS_NEW_FOLDER,
    originalFolder: TOKENS_ORIGINAL_FOLDER,
  })
}

convertNewAssetsToSvg()
