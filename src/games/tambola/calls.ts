// Tambola announcer script. The host is an original comic Delhi tapori who talks in Hindi;
// only the number call itself is in English. Screens show the English FUN lines instead.
// The announcer says callSpoken(n) for each number and LINES for game moments.
// Only erasable TS syntax here so scripts/gen-audio.mjs can import it with Node.

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

/**
 * What the host says after each number call: the same joke as FUN, told in Delhi-tapori Hindi.
 * Written in Devanagari so the voice pronounces it properly. Keep each one short.
 */
export const SPOKEN: Record<number, string> = {
  1: 'शर्मा जी का लड़का, हमेशा नंबर वन! पढ़ाकू कहीं का!',
  2: 'तू और मैं, बस हम दो! अब बजाओ कोई रोमांटिक गाना!',
  3: 'एक कप चाय! अदरक डाल के, कड़क वाली!',
  4: 'दरवाज़े पे दस्तक! ससुराल वाले आ गए, अच्छे वाले स्नैक्स छुपाओ!',
  5: 'पाँच पांडव! और पाँचों को विंडो सीट चाहिए!',
  6: 'धिशूम! छक्का! बॉल गई पड़ोसी के गार्डन में, अब कौन लाएगा?',
  7: 'सात फेरे! अब पीछे नहीं हट सकते, भाई साहब!',
  8: 'गार्डन का गेट! जहाँ आंटियों की प्रेस कॉन्फ्रेंस चलती है!',
  9: 'डॉक्टर! हर इंडियन मम्मी-पापा का सपना!',
  10: 'परफेक्ट टेन! एकदम मम्मी की बिरयानी जैसा, कोई बहस नहीं!',
  11: 'पूरी क्रिकेट टीम! बस अंपायर गायब है!',
  12: 'एक दर्जन केले! मोलभाव करके आधे दाम में, क्या बात है!',
  13: 'कुछ के लिए अनलकी… पर अपने लिए तो फुल लकी!',
  14: 'वैलेंटाइन डे! अंकल जी अचानक बड़े रोमांटिक हो गए!',
  15: 'पंद्रह अगस्त! झंडा ऊँचा, सब सलामी दो!',
  16: 'स्वीट सिक्सटीन! और अभी भी पापा से पॉकेट मनी माँग रहा है!',
  17: 'सत्रह है, सत्तर नहीं! शांत हो जाओ अंकल!',
  18: 'वोट डाल सकते हो, पर मम्मी से बहस? कभी नहीं!',
  19: 'टीनएज को टाटा, ज़िम्मेदारियों को नमस्ते! हाय!',
  20: 'टी-ट्वेंटी! पलक झपकी और मैच ख़त्म!',
  21: 'घर की चाबी! फिर से दरवाज़ा खुला किसने छोड़ा?',
  22: 'दो छोटी बत्तखें! क्वैक क्वैक! चलो आंटी जी, मेरे साथ बोलो!',
  23: 'तू और मैं, आम के पेड़ के नीचे! एकदम फ़िल्मी सीन!',
  24: 'चौबीसों घंटे! जितनी देर मम्मी टेंशन लेती है!',
  25: 'क्वार्टर सेंचुरी! बल्ला उठाओ, झुक के सलाम!',
  26: 'छब्बीस जनवरी! परेड सीधा तुम्हारे टिकट की तरफ़ आ रही है!',
  27: 'स्वर्ग का दरवाज़ा! या कम से कम बुफ़े का!',
  28: 'ओवरवेट! दिवाली की मिठाई ज़्यादा हो गई, कोई पछतावा नहीं!',
  29: 'उठ जाओ भाई! चाय ठंडी हो रही है!',
  30: 'तीस के हो गए, और घुटने अभी से शिकायत कर रहे हैं!',
  31: 'न्यू ईयर की रात! अंकल डांस फ्लोर पे! भागो!',
  32: 'बत्तीस दाँत! सारे दिखाओ, स्माइल प्लीज़!',
  33: 'ट्रिपल मुसीबत! अरे बाप रे!',
  34: 'और रसगुल्ले लाओ! डाइट तो सोमवार से है!',
  35: 'कूदो, नाचो! पर ध्यान से अंकल, घुटने!',
  36: 'तीन दर्जन समोसे! तीन मिनट में साफ़!',
  37: 'चालीस होने वाले हैं! श्श्श, किसी को बताना मत!',
  38: 'लेट मत होना! बुफ़े किसी का इंतज़ार नहीं करता!',
  39: 'उनतालीस! हमेशा के लिए, है ना आंटी जी?',
  40: 'अली बाबा चालीस चोर! अपना बटुआ संभालो!',
  41: 'ज़िंदगी चालीस के बाद शुरू होती है! कोई मेरी कमर को बताओ!',
  42: 'हर सवाल का जवाब! पर सवाल क्या था?',
  43: 'आम के पेड़ पे चढ़ गए… और अटक गए! बेचारा!',
  44: 'चौका, चौका! धड़ाम!',
  45: 'आधा रास्ता पार! और आधे स्नैक्स पहले ही साफ़!',
  46: 'मैंने देख लिया! पड़ोसी के टिकट में झाँक रहे हो!',
  47: 'सन सैंतालीस! आज़ादी! टिकट वालो, जोश में आओ!',
  48: 'अड़तालीस घंटे का नोटिस! ससुराल वाले आ रहे हैं! सफ़ाई, सफ़ाई!',
  49: 'पचास से एक कम! बस इतने से रह गया, बेचारा!',
  50: 'हाफ़ सेंचुरी! हेलमेट उतारो, बल्ला उठाओ, भौकाल मचाओ!',
  51: 'इक्यावन! सीधा शगुन के लिफ़ाफ़े में!',
  52: 'ताश की पूरी गड्डी! बाद में तीन पत्ती कौन खेलेगा?',
  53: 'लकी, लकी मी! मिस्टर लकी आ गए!',
  54: 'मम्मी ने बोला झाड़ू लगाओ! कोई बहाना नहीं!',
  55: 'हाई फ़ाइव! हाथ लटकता मत छोड़ना!',
  56: 'छप्पन भोग! बेल्ट ढीली करो भाई!',
  57: 'अठारह सौ सत्तावन! पहली क्रांति! टिकट वालो, बग़ावत करो!',
  58: 'इंतज़ार करवाओ! जैसे प्लंबर बोलता है, बस पाँच मिनट!',
  59: 'बिल्कुल टाइम पे! जैसे देसी शादी, तीन घंटे लेट!',
  60: 'साठ के हो गए, फिर भी हर संगीत में नाच रहे हैं!',
  61: 'बन बनाओ! आंटी जी वाले फ़ेमस बन!',
  62: 'सब बढ़िया है! एकदम बढ़िया! कोई टेंशन नहीं!',
  63: 'गुदगुदी! ही ही, बस करो यार!',
  64: 'चौंसठ खाने! शतरंज की बिसात! चेक… एंड मेट!',
  65: 'रिटायरमेंट! ऑफ़िस को बाय-बाय, व्हाट्सऐप फ़ॉरवर्ड को हेलो!',
  66: 'छक्के पे छक्का! पब्लिक पागल हो गई!',
  67: 'जन्नत की जोड़ी! गुलाब जामुन और आइसक्रीम!',
  68: 'प्लेट भर लो! दूसरी बार लेना कंपलसरी है!',
  69: 'लुकिंग फ़ाइन, फ़ीलिंग फ़ाइन! एकदम फ़र्स्ट क्लास!',
  70: 'सत्तर है, सत्रह नहीं! बैठ जाओ अंकल!',
  71: 'ढोल बजाओ! ढिंचक, ढिंचक!',
  72: 'छह दर्जन! कैसे हो? एकदम मस्त, शुक्रिया!',
  73: 'रानी मधुमक्खी! और इस घर की रानी तो आंटी जी हैं!',
  74: 'टॉफ़ी की दुकान! बच्चो, हमला बोलो!',
  75: 'डायमंड जुबली! चमको, चमको!',
  76: 'डंडे उठाओ! और खिलौने भी, और जूते भी!',
  77: 'डबल सात! डबल लकी, क्या बात है!',
  78: 'स्वर्ग का गेट! लाइन में आओ, धक्का मत दो!',
  79: 'वन्स मोर! एक बार और!',
  80: 'अस्सी दिन में दुनिया की सैर! और फिर भी पार्किंग नहीं मिली!',
  81: 'नानी जी के मज़े! देखो कैसे नाच रही हैं!',
  82: 'सीधे निकल जाओ! ना ट्रैफ़िक, ना सिग्नल!',
  83: 'उन्नीस सौ तिरासी! कपिल की टीम ने कप उठाया! रोंगटे खड़े!',
  84: 'सात दर्जन लड्डू! और एक पहले से गायब है!',
  85: 'ज़िंदा हैं! बड़ी मुश्किल से, उस बुफ़े के बाद!',
  86: 'दादाजी की छड़ी! टक, टक, टक!',
  87: 'स्वर्ग के क़रीब! बस तीन और!',
  88: 'दो मोटे लड्डू! एक मेरा… और दूसरा? वो भी मेरा!',
  89: 'बस पहुँचने वाले हैं! ख़ुशबू आ रही है!',
  90: 'घर की छत! थैली का आख़िरी नंबर!',
};

const OPENERS = [
  'अगला नंबर…',
  'आ गया, आ गया…',
  'ओए, सुनो सुनो…',
  'दिल थाम के बैठो…',
  'टिकट पे नज़र रखो…',
  'श्श्श… ध्यान से…',
  'ड्रमरोल प्लीज़…',
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

/** What the host says: a Hindi build-up now and then, the number in English, then the Hindi joke. */
export function callSpoken(n: number): string {
  let s: string;
  if (n < 10) s = 'All on its own… number ' + numberWord(n) + '!';
  else if (n % 10 === 0) s = cap(numberWord(n)) + '!';
  else s = cap(numberWord(Math.floor(n / 10))) + ' and ' + numberWord(n % 10) + '… ' + numberWord(n) + '!';
  if (n % 4 === 1) s = OPENERS[(n >> 2) % OPENERS.length] + ' ' + s;
  return s + ' ' + (SPOKEN[n] || '');
}

/**
 * Event lines in Delhi-tapori Hindi, keyed by the voice key the game plays (prize names
 * stay in English). Each has one or more variants so repeat moments stay fresh; clip files
 * are named key-variant (bogey-1, bogey-2…). These are only spoken, never shown.
 */
export const LINES: Record<string, string[]> = {
  start: [
    'ओए होए! नमस्ते भाइयो, बहनो, आंटी जी, अंकल जी, और सारे शैतान बच्चो! स्वागत है तम्बोला नाइट में! टिकट पकड़ो, पेन पकड़ो, और दिल थाम के बैठो — आज तो बवाल होने वाला है!',
    'क्या भीड़ है भाई, कसम से! स्वागत है, स्वागत है! आज रात कोई चैंपियन बनके जाएगा… और कोई खाली टिकट लेके! चलो, शुरू करते हैं!',
  ],
  early5: [
    'Early Five! ओहो, किसी ने सुबह-सुबह कड़क चाय पी है! आज का पहला विनर!',
    'Early Five! पाँच नंबर, ज़ीरो रहम! क्या बात है!',
  ],
  top: ['Top Line! फ़ुर्र — गायब, जैसे आख़िरी समोसा!', 'Top Line! ऊपर वाली मंज़िल, सोल्ड आउट!'],
  middle: ['Middle Line! बीचों-बीच, जैसे गरम छुरी मक्खन में!', 'Middle Line! धिशूम! सीधा सेंटर में!'],
  bottom: ['Bottom Line! और बॉटम लाइन ये है कि… अपना विनर आ गया! शाबाश!', 'Bottom Line! बेसमेंट से सीधा पेंटहाउस, एक झटके में!'],
  corners: ['Four Corners! चारों कोने, एकदम पैक!', 'Four Corners! विकेटकीपर जैसा, कुछ भी बचके नहीं निकला!'],
  full: [
    'FULL HOUSE! फ़ुल हाउस! सब रोको, म्यूज़िक रोको — अपना चैंपियन आ गया!',
    'FULL HOUSE! ओए होए होए! पूरा टिकट साफ़! भाई ने तो कसम से बवाल काट दिया! तालियाँ, तालियाँ!',
  ],
  bogey: [
    'BOGEY! ओए, ये क्या किया भाई? चश्मा लगा, टिकट देख, फिर बोल! सीधा जेल — ना बेल, ना समोसा!',
    'BOGEY! अरे भाई साहब, ये क्या रायता फैला दिया? पूरी पब्लिक हँस रही है!',
    'BOGEY! धड़ाम! सीधा कीचड़ वाले पानी में! बेचारा!',
    'BOGEY! क्लेम फ़ेल! कोई इनको टिशू दो यार!',
  ],
  onefull: [
    'ओहो हो हो! किसी को फ़ुल हाउस के लिए बस एक नंबर चाहिए! दिल धक-धक, हाथ पसीना-पसीना!',
    'रुको, रुको! एक टिकट को बस एक नंबर और चाहिए! क्या टेंशन है, क्या ड्रामा है!',
  ],
  half: ['पैंतालीस गए, पैंतालीस बाकी! हाफ़ टाइम! पैर सीधे कर लो, पर ज़्यादा दूर मत जाना!'],
  final: ['तम्बोला नाइट ख़त्म, पैसा वसूल! विनर्स के लिए ज़ोरदार तालियाँ… और बाकी सबको एक बड़ी सी झप्पी!'],
  hype: [
    'टिकट चेक करो भाई लोग! ड्यूटी पे सोना मना है!',
    'आंटी जी, उठ जाओ! अगला नंबर आपका हो सकता है!',
    'ओहो, माहौल गरम हो रहा है! एक्स्ट्रा मिर्ची!',
    'किसी का टिकट मुझे देख के मुस्कुरा रहा है! मुझे दिख रहा है!',
    'ये स्माइल किसकी है? कोई क़रीब पहुँच रहा है… बड़ा शक हो रहा है!',
    'चाय ब्रेक? बिल्कुल नहीं! खेलते रहो!',
    'अंकल जी, फ़ोन नीचे रखो! क्रिकेट का स्कोर बाद में देख लेना!',
    'आज रात का फ़ुल हाउस किंग कौन बनेगा? या क्वीन?',
    'पलक मत झपकाना! अगला नंबर तुम्हारा हो सकता है!',
    'टेंशन… ड्रामा… तम्बोला!',
    'बच्चो, पापा के टिकट पे निशान लगाना बंद करो!',
    'ये चेहरे तो देखो! बोर्ड एग्ज़ाम जैसी कॉन्संट्रेशन!',
    'कोई पड़ोसी के टिकट में झाँक रहा है… मैंने देख लिया!',
    'दिल चेक करो! धक-धक, धक-धक!',
    'क्या गेम है! क्या पब्लिक है! क्या रात है!',
    'समोसे संभाल के रखो! माहौल फ़ुल ऑन हो रहा है!',
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
