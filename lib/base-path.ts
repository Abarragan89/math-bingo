/**
 * The sub-path the site is served under. GitHub Pages serves a project repo at
 * `https://<user>.github.io/<repo>/`, so every URL the app builds by hand needs
 * this prefix. Rename the repo and this is the one line to change.
 *
 * `next/link` hrefs, router navigation and the file-convention metadata routes
 * are prefixed by Next from `basePath` in `next.config.ts` (which reads this
 * constant). Everything else — plain `<a href>`, `new Audio(src)`, the service
 * worker registration, the URLs written into the web manifest — is a bare
 * string that Next never sees, so it goes through `withBasePath`.
 */
export const BASE_PATH = "/math-bingo";

/** Prefixes a root-relative path (`/sounds/a.wav`) with {@link BASE_PATH}. */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
