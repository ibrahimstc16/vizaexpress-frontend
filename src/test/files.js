// Small synthetic files for tests. None of them is a real document.
const bytes = (...values) => new Uint8Array(values);

// A 1×1 PNG.
export const PNG = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
  (c) => c.charCodeAt(0)
);
export const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01);
export const WEBP = new TextEncoder().encode('RIFF\x24\x00\x00\x00WEBPVP8 ');
export const PDF = new TextEncoder().encode('%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n');
export const HTML = new TextEncoder().encode('<!doctype html><script>window.specimenRan = true</script>');
