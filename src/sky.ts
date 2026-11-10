// ASCII art for the sky behind the landing page (src/pages/index.astro). Motion lives in src/styles.css.
// Kept out of the .astro file: quotes and backslashes in the art confuse the Astro compiler.

// Clouds: each drifts at its own height and speed.
export const clouds = [
  String.raw`
        .--.
     .-(    ).
    (___.__)__)`,
  String.raw`
           .-~~~-.
   .- ~ ~-(       )_ _
  /                     ~ -.
 |                           \
  \                         .'
    ~- . _____________ . -~`,
  String.raw`
      _  _
    ( ` + "`" + String.raw`   )_
   (    )    ` + "`" + String.raw`)
  (_   (_ .  _) _)`,
  String.raw`
     .--.    .-.
  .-(    )--(   ).
 (___.___)_____.__)`,
  String.raw`
       __   _
     _(  )_( )_
    (_   _    _)
      (_) (__)`,
  String.raw`
          .-~~-.
  .- ~ ~-(      )- .
 (                   )
  ~- . __________ . ~`,
];

// Things that fly through now and then. Each has two frames that swap, so tails and wings flap.
export const whale = [
  String.raw`
        .
       ":"
     ___:____      |"\/"|
   ,'        '.     \  /
   |  o        \____/  |
    \_________________/`,
  String.raw`
       ' '
       ":"
     ___:____      \"\/"/
   ,'        '.     |  |
   |  o        \____/  |
    \_________________/`,
];
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
