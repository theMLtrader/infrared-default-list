import sharp from 'sharp'

import { getErrorMessage } from './get-error-message'

const EXPECTED_IMAGE_HEIGHT = 128
const EXPECTED_IMAGE_WIDTH = 128

export const checkImageSize = async (filePath: string) => {
  try {
    const metadata = await sharp(filePath).metadata()
    return (
      metadata.height === EXPECTED_IMAGE_HEIGHT &&
      metadata.width === EXPECTED_IMAGE_WIDTH
    )
  } catch (error) {
    console.error(
      `Error checking image size for ${filePath}:`,
      getErrorMessage(error),
    )
    return false
  }
}
