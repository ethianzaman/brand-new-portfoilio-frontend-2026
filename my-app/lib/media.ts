/**
 * An image in an ordered list a dashboard form edits: either already saved
 * (a link) or picked from the computer and waiting to upload.
 */
export interface ImageItem {
  /** Stable key for React and for removing the right one. */
  id: string;
  /** The saved link, or a temporary preview for a picked file. */
  url: string;
  file?: File;
}

let counter = 0;
const nextId = () => `img-${Date.now().toString(36)}-${(counter += 1)}`;

export function itemsFromUrls(urls: (string | null | undefined)[]): ImageItem[] {
  return urls.filter((url): url is string => Boolean(url)).map((url) => ({ id: nextId(), url }));
}

export function itemFromFile(file: File): ImageItem {
  return { id: nextId(), url: URL.createObjectURL(file), file };
}

export function itemFromUrl(url: string): ImageItem {
  return { id: nextId(), url };
}

/** Frees the preview of a picked file. Saved links are left alone. */
export function releaseItem(item: ImageItem) {
  if (item.file) URL.revokeObjectURL(item.url);
}

/**
 * Sends a list in the order the form shows it. Saved links go as they are, and
 * each picked file is named `upload:N`, N counting the files sent under the
 * same field. The API reads the order and uploads the files.
 */
export function appendImageList(formData: FormData, field: string, items: ImageItem[]) {
  let uploads = 0;
  const order = items.map((item) => (item.file ? `upload:${uploads++}` : item.url));
  formData.append(field, JSON.stringify(order));
  for (const item of items) if (item.file) formData.append(field, item.file);
}
