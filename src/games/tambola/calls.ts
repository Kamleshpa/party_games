// Tambola number calls: English, with an Indian twist. The announcer says callSpoken(n).
// Only erasable TS syntax here so scripts/gen-tambola-audio.mjs can import it with Node.

const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function numberWord(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  return n % 10 ? t + '-' + ONES[n % 10] : t;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const FUN: Record<number, string> = {
  1: "Kelly's eye — the one and only!",
  2: 'Just me and you!',
  3: 'Cup of chai!',
  4: 'Knock at the door — the in-laws are here!',
  5: 'The five Pandavas!',
  6: 'Sixer! Out of the stadium!',
  7: 'Seven pheras, seven lifetimes!',
  8: 'Pizza in eight slices!',
  9: "Doctor's orders!",
  10: 'A perfect ten!',
  11: 'The playing eleven!',
  12: 'A dozen bananas!',
  13: 'Unlucky for some, lucky for us!',
  14: "Valentine's Day!",
  15: 'Fifteenth August — Independence Day!',
  16: 'Sweet sixteen!',
  17: 'Seventeen — not seventy!',
  18: 'Old enough to vote!',
  19: 'Goodbye, teens!',
  20: 'T20 — blink and you miss it!',
  21: 'Twenty-one gun salute!',
  22: 'Two little ducks — quack quack!',
  24: "Twenty-four by seven — like mom's worrying!",
  25: 'Quarter century!',
  26: 'Twenty-sixth January — Republic Day!',
  28: "February's done!",
  31: "New Year's Eve!",
  32: 'Thirty-two teeth — say cheese!',
  33: 'Double trouble!',
  39: 'Last party before forty!',
  40: "Ali Baba's forty thieves!",
  41: 'Life begins after forty!',
  44: 'Two fours — boundary, boundary!',
  45: 'Halfway there!',
  47: 'The year of Independence!',
  48: "Forty-eight hours' notice!",
  50: 'Half century — raise the bat!',
  51: 'Fifty-one in the shagun envelope!',
  52: 'A full deck of cards!',
  55: 'All the fives — high five!',
  56: 'Chhappan bhog — fifty-six dishes!',
  57: 'Eighteen fifty-seven — the first revolt!',
  60: 'Sixty and still young!',
  64: 'Sixty-four squares — chess board!',
  65: 'Retirement time!',
  66: 'Sixer after sixer!',
  70: 'Seventy — not seventeen!',
  75: 'Seventy-five years of Independence!',
  77: 'Lucky seven, twice!',
  80: 'Around the world in eighty days!',
  83: "Nineteen eighty-three — Kapil's World Cup!",
  88: 'Two fat laddoos!',
  89: 'Almost there!',
  90: 'Top of the house!',
};

/** Line under the big number, e.g. "Two and five — twenty-five". */
export function callTitle(n: number): string {
  if (n < 10) return 'Single number ' + numberWord(n);
  if (n % 10 === 0) return cap(numberWord(n));
  return cap(numberWord(Math.floor(n / 10))) + ' and ' + numberWord(n % 10) + ' — ' + numberWord(n);
}

export function callFun(n: number): string {
  return FUN[n] || '';
}

/** What the announcer says. */
export function callSpoken(n: number): string {
  const base = callTitle(n).replace(' — ', ', ') + '!';
  return FUN[n] ? base + ' ' + FUN[n] : base;
}

export const EXTRA_CLIPS: Record<string, string> = {
  start: "Let's play Tambola! Get your tickets ready!",
  early5: 'Early five!',
  top: 'Top line!',
  middle: 'Middle line!',
  bottom: 'Bottom line!',
  corners: 'Four corners!',
  full: 'Full house! Full house!',
  bogey: 'Bogey! Bogey! False claim!',
};
