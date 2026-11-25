// Tambola announcer script: English with a desi twist. The announcer says callSpoken(n).
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

/** One fun line per number: classic housie rhymes, Bollywood, cricket, food and family jokes. */
export const FUN: Record<number, string> = {
  1: "Kelly's eye — and Sharma ji's son, always number one!",
  2: 'Me and you — just the two of us!',
  3: 'Cup of chai — make it extra strong!',
  4: "Knock at the door — it's the in-laws, hide the snacks!",
  5: 'The five Pandavas — ready for battle!',
  6: "Sixer! That one's out of the stadium!",
  7: 'Seven pheras, seven lifetimes!',
  8: 'Garden gate — where the aunties gossip!',
  9: "Doctor's orders — every desi parent's dream!",
  10: "A perfect ten — just like Mom's biryani!",
  11: 'Legs eleven — the playing eleven!',
  12: 'One dozen bananas — bargained down to half price!',
  13: 'Unlucky for some — lucky for us!',
  14: "Valentine's Day — love is in the air!",
  15: 'Fifteenth August — Independence Day!',
  16: 'Sweet sixteen — and still asking for pocket money!',
  17: 'Seventeen — not seventy!',
  18: 'Old enough to vote — not old enough to argue with Mummy!',
  19: 'Goodbye, teenage years!',
  20: "T20 — blink and you'll miss it!",
  21: 'Twenty-one gun salute — boom!',
  22: 'Two little ducks — quack quack!',
  23: 'Thee and me — under the mango tree!',
  24: "Twenty-four by seven — just like Mom's worrying!",
  25: 'Quarter century — silver jubilee!',
  26: 'Twenty-sixth January — Republic Day parade!',
  27: 'Gateway to heaven!',
  28: 'Overweight — too much Diwali mithai!',
  29: 'Rise and shine!',
  30: 'Thirty — and still young at heart!',
  31: "New Year's Eve — party all night!",
  32: 'Thirty-two teeth — say cheese!',
  33: 'All the threes — double trouble!',
  34: 'Ask for more — more rasgullas, please!',
  35: 'Jump and jive!',
  36: 'Three dozen samosas — coming right up!',
  37: "Almost forty — don't tell anyone!",
  38: "Don't be late — the buffet is open!",
  39: 'The last party before forty!',
  40: 'Ali Baba and the forty thieves!',
  41: 'Life begins after forty!',
  42: 'The answer to everything!',
  43: 'Climb the mango tree!',
  44: 'All the fours — boundary, boundary!',
  45: 'Halfway there — and still alive!',
  46: 'Up to tricks!',
  47: 'The year of Independence!',
  48: "Forty-eight hours' notice — the in-laws are coming!",
  49: 'One short of a half century — so close!',
  50: 'Half century — take a bow!',
  51: 'Straight into the shagun envelope!',
  52: 'A full deck of cards!',
  53: 'Lucky, lucky me!',
  54: 'Mummy says — sweep the floor!',
  55: 'All the fives — high five!',
  56: 'Chhappan bhog — fifty-six dishes!',
  57: 'Eighteen fifty-seven — the first revolt!',
  58: 'Make them wait!',
  59: 'Just in time!',
  60: 'Sixty — and still young!',
  61: 'Bake a bun!',
  62: 'Tickety-boo!',
  63: 'Tickle me!',
  64: 'Sixty-four squares — a chess board!',
  65: 'Retirement time!',
  66: 'Sixer after sixer!',
  67: 'Made in heaven!',
  68: 'Pile it on the plate!',
  69: 'Looking fine!',
  70: 'Seventy — not seventeen!',
  71: 'Bang the dhol drum!',
  72: 'Six dozen — how do you do!',
  73: 'Queen bee!',
  74: 'Candy store!',
  75: 'Seventy-five years of Independence!',
  76: 'Pick up sticks!',
  77: 'Lucky seven, twice — double lucky!',
  78: "Heaven's gate!",
  79: 'One more time!',
  80: 'Around the world in eighty days!',
  81: "Nani's having fun!",
  82: 'Straight on through!',
  83: "Nineteen eighty-three — Kapil's World Cup!",
  84: "Seven dozen — that's a lot of laddoos!",
  85: 'Staying alive!',
  86: "Dadaji's walking stick!",
  87: 'Almost heaven!',
  88: 'Two fat laddoos!',
  89: 'Nearly there!',
  90: 'Top of the house!',
};

const OPENERS = ['Next number…', 'Here it comes…', 'Eyes on your tickets…', 'Ooh, ladies and gentlemen…', 'Fingers ready…'];

/** Line under the big number, e.g. "Two and five — twenty-five". */
export function callTitle(n: number): string {
  if (n < 10) return 'Single number ' + numberWord(n);
  if (n % 10 === 0) return cap(numberWord(n));
  return cap(numberWord(Math.floor(n / 10))) + ' and ' + numberWord(n % 10) + ' — ' + numberWord(n);
}

export function callFun(n: number): string {
  return FUN[n] || '';
}

/** What the announcer says — a little theatre: build-up, the number, then the fun line. */
export function callSpoken(n: number): string {
  let s: string;
  if (n < 10) s = 'All on its own… number ' + numberWord(n) + '!';
  else if (n % 10 === 0) s = cap(numberWord(n)) + '!';
  else s = cap(numberWord(Math.floor(n / 10))) + ' and ' + numberWord(n % 10) + '… ' + numberWord(n) + '!';
  if (n % 4 === 1) s = OPENERS[(n >> 2) % OPENERS.length] + ' ' + s;
  return s + ' ' + (FUN[n] || '');
}

/** Event lines. Keys match the voice clip file names. */
export const EXTRA_CLIPS: Record<string, string> = {
  start: "Namaste, ladies and gentlemen, aunties and uncles! Welcome to Tambola Night! Grab your tickets, get those fingers ready… and let's play!",
  early5: 'Early Five! We have our first winner of the night!',
  top: 'Top Line! The top line is gone!',
  middle: 'Middle Line! Right through the middle!',
  bottom: 'Bottom Line! And the bottom line is… we have a winner!',
  corners: 'Four Corners! All four corners — covered!',
  full: 'FULL HOUSE! Full house! Stop everything — we have a champion!',
  bogey: 'BOGEY! Bogey! Fake claim alert! Straight to jail — no bail!',
  onefull: 'Oh ho ho! Somebody is just ONE number away from Full House! Hearts are pounding!',
  half: 'Forty-five numbers down, forty-five to go! We are halfway there!',
  final: "That's a wrap on Tambola Night! A big round of applause for all our winners!",
};

/** Random hype lines dropped in between numbers (files hype1, hype2, …). */
export const HYPE: string[] = [
  'Check your tickets, people!',
  'Aunty ji, wake up — your number might be next!',
  'Ooh, this is getting spicy!',
  "Somebody's ticket is looking very lucky tonight!",
  "Is that a smile I see? Somebody's getting close!",
  'Chai break? No way — keep playing!',
  'Fingers ready, eyes on the board!',
  "Who will be tonight's Full House champion?",
  "Don't blink — the next one could be yours!",
  'The tension… the drama… the Tambola!',
];
