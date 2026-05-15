/** Raster types we re-encode as JPEG for smaller uploads */
const RASTER_IMAGE =
  /^image\/(jpeg|jpg|pjpeg|png|webp)$/i;

/**
 * Downscale and JPEG-encode payment screenshots in the browser so uploads stay small.
 * PDFs and non-raster images are returned unchanged.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressPaymentScreenshot(file) {
  if (!file?.type?.startsWith("image/")) {
    return file;
  }
  if (file.type === "image/svg+xml") {
    return file;
  }
  if (!RASTER_IMAGE.test(file.type)) {
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const maxEdge = 1920;
  const quality = 0.78;
  const { width: ow, height: oh } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(ow, oh, 1));
  const w = Math.max(1, Math.round(ow * scale));
  const h = Math.max(1, Math.round(oh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  let blob;
  try {
    blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        quality
      );
    });
  } catch {
    return file;
  }

  const base =
    file.name.replace(/\.[^.]+$/i, "").replace(/\s+/g, "-") ||
    "payment-proof";
  const out = new File([blob], `${base}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  if (out.size < file.size) {
    return out;
  }
  if (file.type === "image/jpeg" || file.type === "image/pjpeg") {
    return file;
  }
  return out;
}
