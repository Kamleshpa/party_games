// Tambola announcer script: a zany game-show commentator, English with desi masala.
// The announcer says callSpoken(n) for each number and LINES for game moments.
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

/**
 * One line of running commentary per number, said right after it: a zany game-show
 * commentator with a desi twist. Classic housie rhymes, cricket, Bollywood, food and family.
 * Also shown under the big number on the TV, so keep each one short.
 */
export const FUN: Record<number, string> = {
  1: "Kelly's eye! Like Sharma ji's son — topper, as usual!",
  2: 'Me and you, just us two — cue the romantic song!',
  3: 'Cup of tea — arre, extra adrak, please!',
  4: "Knock at the door — it's the in-laws! Hide the good snacks!",
  5: 'Five Pandavas — and all five want the window seat!',
  6: "Dhishoom! Sixer! The ball is in the neighbour's garden!",
  7: 'Seven pheras — no turning back now, bhai sahab!',
  8: 'Garden gate — where the aunties hold their press conference!',
  9: "Doctor's orders! Every desi parent's dream!",
  10: "A perfect ten — like Mummy's biryani! No arguments!",
  11: 'Legs eleven — the full cricket team, minus the umpire!',
  12: 'One dozen bananas — bargained down to half price! Kya baat hai!',
  13: "Unlucky for some — but who's counting? Not me!",
  14: "Valentine's Day — and uncle is suddenly very romantic!",
  15: 'Fifteenth August — flags up, everybody salute!',
  16: 'Sweet sixteen — and still asking Papa for pocket money!',
  17: "Seventeen — not seventy! Don't get excited, uncle!",
  18: 'Old enough to vote — not old enough to argue with Mummy!',
  19: 'Bye-bye teenage, hello responsibilities! Haaye!',
  20: "T20! Blink and you'll miss it — whoosh!",
  21: 'Key of the door — who left it open again?',
  22: 'Two little ducks — quack quack! Come on aunty, quack with me!',
  23: 'Thee and me, under the mango tree — very filmy!',
  24: "Twenty-four seven — that's how long Mummy worries!",
  25: 'Quarter century! Raise the bat, take a bow!',
  26: 'Republic Day! The parade is marching straight to your ticket!',
  27: 'Gateway to heaven — or at least to the buffet!',
  28: 'Overweight — too much Diwali mithai! No regrets!',
  29: 'Rise and shine — the chai is getting cold!',
  30: 'Thirty — and the knees are already complaining!',
  31: "New Year's Eve — uncle is on the dance floor! Run!",
  32: 'Thirty-two teeth — show them all, say cheese!',
  33: 'All the threes — triple trouble! Arre baap re!',
  34: 'Ask for more — more rasgullas! The diet starts Monday!',
  35: 'Jump and jive — careful, uncle, the knees!',
  36: 'Three dozen samosas — gone in three minutes!',
  37: 'Almost forty — shh, nobody tell anyone!',
  38: "Don't be late — the buffet waits for no one!",
  39: 'Thirty-nine — forever and ever, right aunty?',
  40: 'Ali Baba and the forty thieves — check your wallets!',
  41: 'Life begins at forty — somebody please tell my back!',
  42: 'The answer to everything! What was the question again?',
  43: 'Climb the mango tree — and get stuck up there! Bechara!',
  44: 'All the fours — boundary, boundary! Dhadaam!',
  45: 'Halfway there — and the snacks are already halfway gone!',
  46: "Up to tricks — I see you peeking at the neighbour's ticket!",
  47: 'Nineteen forty-seven — freedom! Tickets, rise up!',
  48: "Forty-eight hours' notice — the in-laws are coming! Clean, clean, clean!",
  49: 'One short of a half century — so close! Bechara!',
  50: 'Half century! Helmet off, bat up, kiss the pitch!',
  51: 'Fifty-one — straight into the shagun envelope!',
  52: "A full deck of cards — who's dealing teen patti later?",
  53: 'Lucky, lucky me — Mister Lucky has arrived!',
  54: 'Mummy says sweep the floor — no excuses!',
  55: "All the fives — high five! Don't leave me hanging!",
  56: 'Chhappan bhog — fifty-six dishes! Loosen the belt!',
  57: 'Eighteen fifty-seven — the first revolt! Tickets, revolt!',
  58: 'Make them wait — like the plumber who said five minutes!',
  59: 'Just in time — like a desi wedding, three hours late!',
  60: 'Sixty — and still dancing at every sangeet!',
  61: "Bake a bun — aunty's famous ones, please!",
  62: "Tickety-boo — everything's fine! Absolutely fine!",
  63: 'Tickle me — hee hee, stop it!',
  64: 'Sixty-four squares — a chess board! Check… and mate!',
  65: 'Retirement time — goodbye office, hello WhatsApp forwards!',
  66: 'Clickety-click! Sixer after sixer — the crowd goes mad!',
  67: 'Made in heaven — like gulab jamun with ice cream!',
  68: 'Pile it on the plate — second helpings are compulsory!',
  69: 'Looking fine, feeling fine — ekdum first class!',
  70: 'Seventy — not seventeen! Sit down, uncle!',
  71: 'Bang the dhol — dhinchak, dhinchak!',
  72: 'Six dozen — how do you do? Very well, thank you!',
  73: 'Queen bee — and aunty rules this house!',
  74: 'Candy store — kids, attack!',
  75: 'Diamond jubilee — sparkle, sparkle!',
  76: 'Pick up sticks — and the toys, and the shoes!',
  77: 'Lucky seven, twice! Double lucky — kya baat hai!',
  78: "Heaven's gate — please queue, no pushing!",
  79: 'One more time! Encore! Once more!',
  80: 'Around the world in eighty days — and still no parking!',
  81: "Nani's having fun — look at her go!",
  82: 'Straight on through — no traffic, no signals!',
  83: "Nineteen eighty-three — Kapil's devils lift the Cup! Goosebumps!",
  84: 'Seven dozen laddoos — and one is already missing!',
  85: 'Staying alive — barely, after that buffet!',
  86: "Dadaji's walking stick — tap, tap, tap!",
  87: 'Almost heaven — just three more to go!',
  88: 'Two fat laddoos — one for me, and one for… also me!',
  89: 'Nearly there — so close I can smell it!',
  90: 'Top of the house! The very last number in the bag!',
};

const OPENERS = [
  'Next number…',
  'Ooh, here it comes…',
  'Hold on to your samosas…',
  'Ladies and gentlemen, aunties and uncles…',
  'Drumroll, please…',
  'Eyes on your tickets…',
  'Shh, shh, shh…',
];

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

/**
 * Event lines, keyed by the voice key the game plays. Each has one or more variants so
 * repeat moments stay fresh; clip files are named key-variant (bogey-1, bogey-2…).
 */
export const LINES: Record<string, string[]> = {
  start: [
    "Namaste, ladies and gentlemen, aunties and uncles, and all you naughty kids! Welcome to Tambola Night — the most dangerous game show in the house! Tickets ready? Fingers ready? Let the drama begin!",
    "Arre, what a crowd! Welcome, welcome to Tambola Night! Tonight, somebody goes home a champion… and somebody goes home with a blank ticket! Chalo, let's play!",
  ],
  early5: [
    'Early Five! Oho, somebody had their morning chai! First winner of the night!',
    'Early Five! Five numbers, zero mercy! Kya baat hai!',
  ],
  top: [
    'Top Line! Whoosh — gone, like the last samosa!',
    'Top Line! Up, up and away — the top floor is sold out!',
  ],
  middle: [
    'Middle Line! Right through the middle — like a hot knife through butter!',
    'Middle Line! Dhishoom! Straight down the centre!',
  ],
  bottom: [
    'Bottom Line! And the bottom line is… we have a winner! Shabash!',
    'Bottom Line! From the basement to the penthouse in one shot!',
  ],
  corners: [
    'Four Corners! Corner, corner, corner, corner — all boxed in!',
    'Four Corners! Like a wicketkeeper — nothing gets past!',
  ],
  full: [
    'FULL HOUSE! Full house! Stop everything, stop the music — we have a champion!',
    'FULL HOUSE! Arre baap re! The whole ticket is gone! Bow down, everybody, bow down!',
  ],
  bogey: [
    'BOGEY! Oh no no no! Fake claim! Straight to jail — no bail, no lawyer, no samosa!',
    'BOGEY! Arre bhai sahab, what was that? Glasses on, please, and check that ticket!',
    "BOGEY! Ouch! That's a big splash, straight into the muddy water! Bechara!",
    'BOGEY! The claim has failed! The crowd is laughing! Somebody bring a tissue!',
  ],
  onefull: [
    'Oh ho ho! Somebody is just ONE number away from Full House! Hearts pounding, palms sweating!',
    'Hold everything! One ticket needs just ONE more number! The tension! The drama!',
  ],
  half: ["Forty-five down, forty-five to go! It's halftime! Stretch your legs — but not too far!"],
  final: [
    "That's a wrap on Tambola Night! A big round of applause for our winners — and a big hug for everyone else!",
  ],
  hype: [
    'Check your tickets, people! No sleeping on duty!',
    'Aunty ji, wake up — your number might be next!',
    "Ooh, it's getting spicy — extra mirchi!",
    "Somebody's ticket is smiling at me! I can see it!",
    "Is that a smile I see? Somebody's getting close… very suspicious!",
    'Chai break? No chance — keep playing!',
    'Uncle, put the phone down — the cricket score can wait!',
    "Who will be tonight's Full House king or queen?",
    "Don't blink — the next one could be yours!",
    'The tension… the drama… the Tambola!',
    "Kids, stop marking Papa's ticket for him!",
    'Look at those faces — pure concentration, like board exams!',
    "Somebody is peeking at the neighbour's ticket… I saw that!",
    'Heartbeat check! Dhak dhak, dhak dhak!',
    'What a game! What a crowd! What a night!',
    "Hold on to your samosas — it's getting wild!",
  ],
};

/** Clip file for one variant of an event line: clipName('bogey', 3) -> 'bogey-3'. */
export function clipName(key: string, variant: number): string {
  return key + '-' + variant;
}

/** Text of a clip file: '25' is number 25, 'bogey-3' is the third bogey line. */
export function clipText(file: string): string {
  if (/^\d+$/.test(file)) return callSpoken(Number(file));
  const dash = file.lastIndexOf('-');
  const pool = dash > 0 ? LINES[file.slice(0, dash)] : undefined;
  return (pool && pool[Number(file.slice(dash + 1)) - 1]) || '';
}
