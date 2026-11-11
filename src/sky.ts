// ASCII art for the sky behind the landing page (src/pages/index.astro). The clouds and whale live in src/skysea.ts.
// Kept out of the .astro file: quotes and backslashes in the art confuse the Astro compiler.

export const birds = [
  String.raw`
  \v/        \v/
        \v/
                 \v/`,
  String.raw`
  /^\        /^\
        /^\
                 /^\ `,
];
export const stars = ["+", ".", "*", "+", ".", "*", ".", "+", "*", ".", "+", "."];
