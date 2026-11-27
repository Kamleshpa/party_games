// Filmy Dialogues: famous Hindi film lines (read out by an AI narrator, never the film audio)
// and song rounds (only the song TITLE is shown and read; no lyrics, no song audio).
// Only erasable TypeScript here: the audio generator imports this file directly with Node.
//
// Rules for new entries:
// - the line or song title must not contain the film's name (that gives the answer away)
// - keep it family-friendly; kids are playing
// - `hi` is what the voice says: Devanagari so the Hindi is pronounced properly,
//   English words can stay in English

export interface Film {
  y: number;
  star: string;
}

export const FILMS: Record<string, Film> = {
  // dialogue films
  Sholay: { y: 1975, star: 'Amitabh Bachchan & Dharmendra' },
  'Mr. India': { y: 1987, star: 'Anil Kapoor & Sridevi' },
  Deewaar: { y: 1975, star: 'Amitabh Bachchan & Shashi Kapoor' },
  'Dilwale Dulhania Le Jayenge': { y: 1995, star: 'Shah Rukh Khan & Kajol' },
  Shahenshah: { y: 1988, star: 'Amitabh Bachchan' },
  'Amar Prem': { y: 1972, star: 'Rajesh Khanna & Sharmila Tagore' },
  Anand: { y: 1971, star: 'Rajesh Khanna & Amitabh Bachchan' },
  Baazigar: { y: 1993, star: 'Shah Rukh Khan' },
  'Om Shanti Om': { y: 2007, star: 'Shah Rukh Khan & Deepika Padukone' },
  'Jab We Met': { y: 2007, star: 'Kareena Kapoor & Shahid Kapoor' },
  '3 Idiots': { y: 2009, star: 'Aamir Khan' },
  Dabangg: { y: 2010, star: 'Salman Khan & Sonakshi Sinha' },
  Wanted: { y: 2009, star: 'Salman Khan' },
  Damini: { y: 1993, star: 'Meenakshi Seshadri & Sunny Deol' },
  Kaalia: { y: 1981, star: 'Amitabh Bachchan' },
  'Chak De! India': { y: 2007, star: 'Shah Rukh Khan' },
  'Uri: The Surgical Strike': { y: 2019, star: 'Vicky Kaushal' },
  'Chennai Express': { y: 2013, star: 'Shah Rukh Khan & Deepika Padukone' },
  'Hera Pheri': { y: 2000, star: 'Akshay Kumar, Suniel Shetty & Paresh Rawal' },
  'Andaz Apna Apna': { y: 1994, star: 'Aamir Khan & Salman Khan' },
  'Kuch Kuch Hota Hai': { y: 1998, star: 'Shah Rukh Khan, Kajol & Rani Mukerji' },
  'Maine Pyar Kiya': { y: 1989, star: 'Salman Khan & Bhagyashree' },
  Agneepath: { y: 1990, star: 'Amitabh Bachchan' },
  'Yeh Jawaani Hai Deewani': { y: 2013, star: 'Ranbir Kapoor & Deepika Padukone' },
  'Gully Boy': { y: 2019, star: 'Ranveer Singh & Alia Bhatt' },
  'Munna Bhai M.B.B.S.': { y: 2003, star: 'Sanjay Dutt' },
  Zanjeer: { y: 1973, star: 'Amitabh Bachchan' },
  'Kabhi Khushi Kabhie Gham': { y: 2001, star: 'Amitabh Bachchan & Shah Rukh Khan' },
  Singham: { y: 2011, star: 'Ajay Devgn' },
  Dangal: { y: 2016, star: 'Aamir Khan' },
  PK: { y: 2014, star: 'Aamir Khan' },
  'Mughal-e-Azam': { y: 1960, star: 'Dilip Kumar & Madhubala' },
  Waqt: { y: 1965, star: 'Sunil Dutt & Raaj Kumar' },
  Pakeezah: { y: 1972, star: 'Meena Kumari & Raaj Kumar' },
  'Namak Halaal': { y: 1982, star: 'Amitabh Bachchan' },
  Welcome: { y: 2007, star: 'Akshay Kumar & Nana Patekar' },
  Gadar: { y: 2001, star: 'Sunny Deol' },
  Kick: { y: 2014, star: 'Salman Khan' },
  'Rowdy Rathore': { y: 2012, star: 'Akshay Kumar' },
  Jawan: { y: 2023, star: 'Shah Rukh Khan' },
  // song films
  'Dil Se': { y: 1998, star: 'Shah Rukh Khan & Manisha Koirala' },
  Aradhana: { y: 1969, star: 'Rajesh Khanna & Sharmila Tagore' },
  Tezaab: { y: 1988, star: 'Anil Kapoor & Madhuri Dixit' },
  'Hum Aapke Hain Koun': { y: 1994, star: 'Salman Khan & Madhuri Dixit' },
  'Rab Ne Bana Di Jodi': { y: 2008, star: 'Shah Rukh Khan & Anushka Sharma' },
  'Bunty Aur Babli': { y: 2005, star: 'Abhishek Bachchan & Rani Mukerji' },
  Dilwale: { y: 2015, star: 'Shah Rukh Khan & Kajol' },
  'Ra.One': { y: 2011, star: 'Shah Rukh Khan & Kareena Kapoor' },
  'Tees Maar Khan': { y: 2010, star: 'Akshay Kumar & Katrina Kaif' },
  Queen: { y: 2014, star: 'Kangana Ranaut' },
  'Baar Baar Dekho': { y: 2016, star: 'Sidharth Malhotra & Katrina Kaif' },
  'Ram-Leela': { y: 2013, star: 'Ranveer Singh & Deepika Padukone' },
  Devdas: { y: 2002, star: 'Shah Rukh Khan, Aishwarya Rai & Madhuri Dixit' },
  'Jo Jeeta Wohi Sikandar': { y: 1992, star: 'Aamir Khan' },
  '1942: A Love Story': { y: 1994, star: 'Anil Kapoor & Manisha Koirala' },
  Mohra: { y: 1994, star: 'Akshay Kumar & Raveena Tandon' },
  'Main Khiladi Tu Anari': { y: 1994, star: 'Akshay Kumar & Saif Ali Khan' },
  'Kal Ho Naa Ho': { y: 2003, star: 'Shah Rukh Khan, Saif Ali Khan & Preity Zinta' },
  Dostana: { y: 2008, star: 'Abhishek Bachchan & John Abraham' },
  Befikre: { y: 2016, star: 'Ranveer Singh & Vaani Kapoor' },
  'Aashiqui 2': { y: 2013, star: 'Aditya Roy Kapur & Shraddha Kapoor' },
  Brahmastra: { y: 2022, star: 'Ranbir Kapoor & Alia Bhatt' },
  'Rocky Aur Rani Kii Prem Kahaani': { y: 2023, star: 'Ranveer Singh & Alia Bhatt' },
  'Bajirao Mastani': { y: 2015, star: 'Ranveer Singh, Deepika Padukone & Priyanka Chopra' },
  Padmaavat: { y: 2018, star: 'Deepika Padukone, Ranveer Singh & Shahid Kapoor' },
  'Dil Dhadakne Do': { y: 2015, star: 'Ranveer Singh, Priyanka Chopra & Anushka Sharma' },
  'Zindagi Na Milegi Dobara': { y: 2011, star: 'Hrithik Roshan, Farhan Akhtar & Abhay Deol' },
  'Dil Chahta Hai': { y: 2001, star: 'Aamir Khan, Saif Ali Khan & Akshaye Khanna' },
  'Shree 420': { y: 1955, star: 'Raj Kapoor & Nargis' },
  'Qayamat Se Qayamat Tak': { y: 1988, star: 'Aamir Khan & Juhi Chawla' },
  Masoom: { y: 1983, star: 'Naseeruddin Shah & Shabana Azmi' },
  'Haathi Mere Saathi': { y: 1971, star: 'Rajesh Khanna' },
  Thanedaar: { y: 1990, star: 'Sanjay Dutt & Madhuri Dixit' },
  'Pyaar Kiya To Darna Kya': { y: 1998, star: 'Salman Khan & Kajol' },
  'Dil To Pagal Hai': { y: 1997, star: 'Shah Rukh Khan, Madhuri Dixit & Karisma Kapoor' },
  'Band Baaja Baaraat': { y: 2010, star: 'Ranveer Singh & Anushka Sharma' },
  Ready: { y: 2011, star: 'Salman Khan & Asin' },
  'Kaho Naa... Pyaar Hai': { y: 2000, star: 'Hrithik Roshan & Ameesha Patel' },
  'Delhi-6': { y: 2009, star: 'Abhishek Bachchan & Sonam Kapoor' },
  'Wake Up Sid': { y: 2009, star: 'Ranbir Kapoor & Konkona Sen Sharma' },
  Sanju: { y: 2018, star: 'Ranbir Kapoor' },
  Raazi: { y: 2018, star: 'Alia Bhatt' },
  'Taare Zameen Par': { y: 2007, star: 'Aamir Khan & Darsheel Safary' },
  'Disco Dancer': { y: 1982, star: 'Mithun Chakraborty' },
  'Biwi No.1': { y: 1999, star: 'Salman Khan, Karisma Kapoor & Sushmita Sen' },
  Vishwatma: { y: 1992, star: 'Sunny Deol & Divya Bharti' },
  'Yeh Dillagi': { y: 1994, star: 'Akshay Kumar, Kajol & Saif Ali Khan' },
  'Jaane Tu... Ya Jaane Na': { y: 2008, star: 'Imran Khan & Genelia D’Souza' },
  War: { y: 2019, star: 'Hrithik Roshan & Tiger Shroff' },
  'Tiger Zinda Hai': { y: 2017, star: 'Salman Khan & Katrina Kaif' },
  'Ae Dil Hai Mushkil': { y: 2016, star: 'Ranbir Kapoor, Anushka Sharma & Aishwarya Rai' },
  'Sonu Ke Titu Ki Sweety': { y: 2018, star: 'Kartik Aaryan' },
  'Ek Villain': { y: 2014, star: 'Sidharth Malhotra & Shraddha Kapoor' },
  'Student of the Year': { y: 2012, star: 'Sidharth Malhotra, Varun Dhawan & Alia Bhatt' },
  'Woh Kaun Thi?': { y: 1964, star: 'Manoj Kumar & Sadhana' },
  Kismat: { y: 1968, star: 'Biswajeet & Babita' },
  Don: { y: 1978, star: 'Amitabh Bachchan' },
};

export interface Dialogue {
  f: string; // film (a FILMS key)
  line: string; // shown on the TV (romanized Hindi)
  hi: string; // read by the voice
  en: string; // English meaning, shown with the answer
  v?: 'f'; // spoken by a woman in the film
}

export const DIALOGUES: Dialogue[] = [
  { f: 'Sholay', line: 'Kitne aadmi the?', hi: 'कितने आदमी थे?', en: 'How many men were there?' },
  { f: 'Mr. India', line: 'Mogambo khush hua!', hi: 'मोगैम्बो ख़ुश हुआ!', en: 'Mogambo is pleased!' },
  { f: 'Deewaar', line: 'Mere paas maa hai.', hi: 'मेरे पास… माँ है।', en: 'I have Mother.' },
  {
    f: 'Dilwale Dulhania Le Jayenge',
    line: 'Bade bade deshon mein aisi chhoti chhoti baatein hoti rehti hain, Senorita.',
    hi: 'बड़े बड़े देशों में ऐसी छोटी छोटी बातें होती रहती हैं, सेनोरीटा।',
    en: 'In big countries, such little things keep happening, señorita.',
  },
  { f: 'Shahenshah', line: 'Rishte mein toh hum tumhare baap lagte hain…', hi: 'रिश्ते में तो हम तुम्हारे बाप लगते हैं…', en: 'As it happens, I’m your father, by relation…' },
  { f: 'Amar Prem', line: 'Pushpa, I hate tears.', hi: 'पुष्पा… आई हेट टियर्स।', en: 'Pushpa, I hate tears.' },
  { f: 'Anand', line: 'Babumoshai, zindagi badi honi chahiye, lambi nahi.', hi: 'बाबूमोशाय… ज़िंदगी बड़ी होनी चाहिए, लंबी नहीं।', en: 'Life should be big, not long.' },
  { f: 'Baazigar', line: 'Kabhi kabhi kuch jeetne ke liye kuch haarna padta hai.', hi: 'कभी कभी कुछ जीतने के लिए कुछ हारना पड़ता है।', en: 'Sometimes, to win something, you have to lose something.' },
  { f: 'Om Shanti Om', line: 'Picture abhi baaki hai, mere dost!', hi: 'पिक्चर अभी बाक़ी है, मेरे दोस्त!', en: 'The movie isn’t over yet, my friend!' },
  { f: 'Jab We Met', line: 'Main apni favourite hoon!', hi: 'मैं अपनी फ़ेवरेट हूँ!', en: 'I’m my own favourite!', v: 'f' },
  { f: '3 Idiots', line: 'All izz well!', hi: 'ऑल इज़ वेल!', en: 'All is well!' },
  {
    f: 'Dabangg',
    line: 'Thappad se darr nahi lagta sahab, pyaar se lagta hai.',
    hi: 'थप्पड़ से डर नहीं लगता साहब… प्यार से लगता है।',
    en: 'I’m not scared of a slap, sir. I’m scared of love.',
    v: 'f',
  },
  {
    f: 'Wanted',
    line: 'Ek baar jo maine commitment kar di, uske baad toh main khud ki bhi nahi sunta.',
    hi: 'एक बार जो मैंने कमिटमेंट कर दी, उसके बाद तो मैं ख़ुद की भी नहीं सुनता।',
    en: 'Once I make a commitment, I don’t even listen to myself.',
  },
  { f: 'Damini', line: 'Tareekh pe tareekh, tareekh pe tareekh…', hi: 'तारीख़ पे तारीख़… तारीख़ पे तारीख़…', en: 'Date after date, date after date…' },
  { f: 'Kaalia', line: 'Hum jahan khade ho jaate hain, line wahin se shuru hoti hai.', hi: 'हम जहाँ खड़े हो जाते हैं, लाइन वहीं से शुरू होती है।', en: 'Wherever I stand, that’s where the line starts.' },
  { f: 'Chak De! India', line: 'Sattar minute… sattar minute hain tumhare paas.', hi: 'सत्तर मिनट… सत्तर मिनट हैं तुम्हारे पास।', en: 'Seventy minutes. You have seventy minutes.' },
  { f: 'Uri: The Surgical Strike', line: 'How’s the josh?', hi: 'How’s the josh?', en: 'How’s the spirit?' },
  { f: 'Chennai Express', line: 'Don’t underestimate the power of a common man.', hi: 'Don’t underestimate the power of a common man.', en: 'Don’t underestimate the power of a common man.' },
  {
    f: 'Hera Pheri',
    line: 'Utha le re Baba… mereko nahi re, in dono ko utha le!',
    hi: 'उठा ले रे बाबा… मेरे को नहीं रे, इन दोनों को उठा ले!',
    en: 'Take them away, God… not me, these two!',
  },
  {
    f: 'Andaz Apna Apna',
    line: 'Crime Master Gogo naam hai mera, aankhen nikal ke gotiyan khelta hoon main.',
    hi: 'क्राइम मास्टर गोगो नाम है मेरा… आँखें निकाल के गोटियाँ खेलता हूँ मैं!',
    en: 'The name’s Crime Master Gogo, and I play marbles with people’s eyes!',
  },
  { f: 'Kuch Kuch Hota Hai', line: 'Pyaar dosti hai.', hi: 'प्यार… दोस्ती है।', en: 'Love is friendship.' },
  { f: 'Maine Pyar Kiya', line: 'Dosti ka ek usool hai, madam: no sorry, no thank you.', hi: 'दोस्ती का एक उसूल है, मैडम… नो सॉरी, नो थैंक यू।', en: 'Friendship has one rule, madam: no sorry, no thank you.' },
  { f: 'Agneepath', line: 'Vijay Dinanath Chauhan… poora naam.', hi: 'विजय दीनानाथ चौहान… पूरा नाम।', en: 'Vijay Dinanath Chauhan. Full name.' },
  {
    f: 'Yeh Jawaani Hai Deewani',
    line: 'Main udna chahta hoon, daudna chahta hoon, girna bhi chahta hoon… bas rukna nahi chahta.',
    hi: 'मैं उड़ना चाहता हूँ, दौड़ना चाहता हूँ, गिरना भी चाहता हूँ… बस रुकना नहीं चाहता।',
    en: 'I want to fly, to run, even to fall… I just don’t want to stop.',
  },
  { f: 'Gully Boy', line: 'Apna time aayega!', hi: 'अपना टाइम आएगा!', en: 'Our time will come!' },
  { f: 'Munna Bhai M.B.B.S.', line: 'Jaadu ki jhappi!', hi: 'जादू की झप्पी!', en: 'A magic hug!' },
  {
    f: 'Zanjeer',
    line: 'Jab tak baithne ko na kaha jaaye, sharafat se khade raho. Yeh police station hai, tumhare baap ka ghar nahi.',
    hi: 'जब तक बैठने को न कहा जाए, शराफ़त से खड़े रहो। ये पुलिस स्टेशन है, तुम्हारे बाप का घर नहीं।',
    en: 'Until you’re asked to sit, stand politely. This is a police station, not your father’s house.',
  },
  { f: 'Kabhi Khushi Kabhie Gham', line: 'Keh diya na… bas keh diya.', hi: 'कह दिया ना… बस कह दिया।', en: 'I’ve said it. That’s final.' },
  { f: 'Singham', line: 'Aata majhi satakli!', hi: 'आता माझी सटकली!', en: 'Now I’ve lost my temper! (Marathi)' },
  { f: 'Dangal', line: 'Mhaari chhoriyan chhoron se kam hai ke?', hi: 'म्हारी छोरियाँ छोरों से कम हैं के?', en: 'Are our girls any less than the boys?' },
  { f: 'PK', line: 'Wrong number!', hi: 'रॉन्ग नंबर!', en: 'Wrong number!' },
  {
    f: 'Mughal-e-Azam',
    line: 'Salim tujhe marne nahi dega… aur hum, Anarkali, tujhe jeene nahi denge.',
    hi: 'सलीम तुझे मरने नहीं देगा… और हम, अनारकली, तुझे जीने नहीं देंगे।',
    en: 'Salim won’t let you die… and I, Anarkali, won’t let you live.',
  },
  {
    f: 'Waqt',
    line: 'Jinke apne ghar sheeshe ke hon, woh doosron par patthar nahi phenka karte.',
    hi: 'जिनके अपने घर शीशे के हों, वो दूसरों पर पत्थर नहीं फेंका करते।',
    en: 'People who live in glass houses shouldn’t throw stones.',
  },
  {
    f: 'Pakeezah',
    line: 'Aapke paon dekhe, bahut haseen hain. Inhe zameen par mat utariyega, maile ho jaayenge.',
    hi: 'आपके पाँव देखे, बहुत हसीन हैं। इन्हें ज़मीन पर मत उतारिएगा… मैले हो जाएँगे।',
    en: 'I saw your feet; they are lovely. Don’t set them on the ground, they’ll get dirty.',
  },
  { f: 'Namak Halaal', line: 'I can talk English, I can walk English, I can laugh English…', hi: 'I can talk English, I can walk English, I can laugh English…', en: 'I can talk English, I can walk English, I can laugh English…' },
  { f: 'Welcome', line: 'Control Uday, control!', hi: 'कंट्रोल उदय… कंट्रोल!', en: 'Control, Uday, control!' },
  { f: 'Gadar', line: 'Hindustan zindabad tha, zindabad hai, aur zindabad rahega!', hi: 'हिंदुस्तान ज़िंदाबाद था, ज़िंदाबाद है, और ज़िंदाबाद रहेगा!', en: 'Long live India: it was, it is, and it always will be!' },
  { f: 'Kick', line: 'Main dil mein aata hoon, samajh mein nahi.', hi: 'मैं दिल में आता हूँ… समझ में नहीं।', en: 'I get into your heart, not your head.' },
  { f: 'Rowdy Rathore', line: 'Don’t angry me!', hi: 'Don’t angry me!', en: 'Don’t make me angry!' },
  { f: 'Jawan', line: 'Bete ko haath lagaane se pehle, baap se baat kar.', hi: 'बेटे को हाथ लगाने से पहले… बाप से बात कर।', en: 'Before you touch the son, talk to the father.' },
];

export interface Song {
  f: string; // film (a FILMS key)
  t: string; // song title, shown on the TV
  hi: string; // title for the voice
}

export const SONGS: Song[] = [
  { f: 'Dil Se', t: 'Chaiyya Chaiyya', hi: 'छैय्या छैय्या' },
  { f: 'Dilwale Dulhania Le Jayenge', t: 'Tujhe Dekha To', hi: 'तुझे देखा तो' },
  { f: 'Aradhana', t: 'Mere Sapno Ki Rani', hi: 'मेरे सपनों की रानी' },
  { f: 'Tezaab', t: 'Ek Do Teen', hi: 'एक दो तीन' },
  { f: 'Hum Aapke Hain Koun', t: 'Didi Tera Devar Deewana', hi: 'दीदी तेरा देवर दीवाना' },
  { f: 'Rab Ne Bana Di Jodi', t: 'Tujh Mein Rab Dikhta Hai', hi: 'तुझ में रब दिखता है' },
  { f: 'Bunty Aur Babli', t: 'Kajra Re', hi: 'कजरा रे' },
  { f: '3 Idiots', t: 'Zoobi Doobi', hi: 'ज़ूबी डूबी' },
  { f: 'Dilwale', t: 'Gerua', hi: 'गेरुआ' },
  { f: 'Ra.One', t: 'Chammak Challo', hi: 'छम्मक छल्लो' },
  { f: 'Dabangg', t: 'Munni Badnaam Hui', hi: 'मुन्नी बदनाम हुई' },
  { f: 'Tees Maar Khan', t: 'Sheila Ki Jawani', hi: 'शीला की जवानी' },
  { f: 'Chennai Express', t: 'Lungi Dance', hi: 'लुंगी डांस' },
  { f: 'Yeh Jawaani Hai Deewani', t: 'Badtameez Dil', hi: 'बदतमीज़ दिल' },
  { f: 'Queen', t: 'London Thumakda', hi: 'लंदन ठुमकदा' },
  { f: 'Baar Baar Dekho', t: 'Kala Chashma', hi: 'काला चश्मा' },
  { f: 'Ram-Leela', t: 'Nagada Sang Dhol', hi: 'नगाड़ा संग ढोल' },
  { f: 'Devdas', t: 'Dola Re Dola', hi: 'डोला रे डोला' },
  { f: 'Jo Jeeta Wohi Sikandar', t: 'Pehla Nasha', hi: 'पहला नशा' },
  { f: '1942: A Love Story', t: 'Ek Ladki Ko Dekha', hi: 'एक लड़की को देखा' },
  { f: 'Mohra', t: 'Tip Tip Barsa Paani', hi: 'टिप टिप बरसा पानी' },
  { f: 'Main Khiladi Tu Anari', t: 'Chura Ke Dil Mera', hi: 'चुरा के दिल मेरा' },
  { f: 'Kal Ho Naa Ho', t: 'Maahi Ve', hi: 'माही वे' },
  { f: 'Dostana', t: 'Desi Girl', hi: 'देसी गर्ल' },
  { f: 'Befikre', t: 'Nashe Si Chadh Gayi', hi: 'नशे सी चढ़ गई' },
  { f: 'Aashiqui 2', t: 'Tum Hi Ho', hi: 'तुम ही हो' },
  { f: 'Brahmastra', t: 'Kesariya', hi: 'केसरिया' },
  { f: 'Jawan', t: 'Chaleya', hi: 'चलेया' },
  { f: 'Rocky Aur Rani Kii Prem Kahaani', t: 'What Jhumka?', hi: 'वॉट झुमका?' },
  { f: 'Bajirao Mastani', t: 'Malhari', hi: 'मल्हारी' },
  { f: 'Padmaavat', t: 'Ghoomar', hi: 'घूमर' },
  { f: 'Dil Dhadakne Do', t: 'Gallan Goodiyaan', hi: 'गल्लां गुड़ियाँ' },
  { f: 'Zindagi Na Milegi Dobara', t: 'Señorita', hi: 'सेनोरीटा' },
  { f: 'Dil Chahta Hai', t: 'Koi Kahe Kehta Rahe', hi: 'कोई कहे कहता रहे' },
  { f: 'Shree 420', t: 'Mera Joota Hai Japani', hi: 'मेरा जूता है जापानी' },
  { f: 'Qayamat Se Qayamat Tak', t: 'Papa Kehte Hain', hi: 'पापा कहते हैं' },
  { f: 'Masoom', t: 'Lakdi Ki Kaathi', hi: 'लकड़ी की काठी' },
  { f: 'Haathi Mere Saathi', t: 'Chal Chal Chal Mere Haathi', hi: 'चल चल चल मेरे हाथी' },
  { f: 'Thanedaar', t: 'Tamma Tamma Loge', hi: 'तम्मा तम्मा लोगे' },
  { f: 'Pyaar Kiya To Darna Kya', t: 'Oh Oh Jane Jaana', hi: 'ओ ओ जाने जाना' },
  { f: 'Dil To Pagal Hai', t: 'Koi Ladki Hai', hi: 'कोई लड़की है' },
  { f: 'Kabhi Khushi Kabhie Gham', t: 'Bole Chudiyan', hi: 'बोले चूड़ियाँ' },
  { f: 'Kuch Kuch Hota Hai', t: 'Ladki Badi Anjaani Hai', hi: 'लड़की बड़ी अनजानी है' },
  { f: 'Om Shanti Om', t: 'Dard-e-Disco', hi: 'दर्द-ए-डिस्को' },
  { f: 'Band Baaja Baaraat', t: 'Ainvayi Ainvayi', hi: 'ऐंवई ऐंवई' },
  { f: 'Ready', t: 'Character Dheela', hi: 'कैरेक्टर ढीला' },
  { f: 'Kaho Naa... Pyaar Hai', t: 'Ek Pal Ka Jeena', hi: 'एक पल का जीना' },
  { f: 'Delhi-6', t: 'Masakali', hi: 'मसकली' },
  { f: 'Wake Up Sid', t: 'Iktara', hi: 'इकतारा' },
  { f: 'Sanju', t: 'Kar Har Maidaan Fateh', hi: 'कर हर मैदान फ़तेह' },
  { f: 'Raazi', t: 'Dilbaro', hi: 'दिलबरो' },
  { f: 'Taare Zameen Par', t: 'Bum Bum Bole', hi: 'बम बम बोले' },
  { f: 'Disco Dancer', t: 'Jimmy Jimmy Jimmy Aaja', hi: 'जिमी जिमी जिमी आजा' },
  { f: 'Biwi No.1', t: 'Chunari Chunari', hi: 'चुनरी चुनरी' },
  { f: 'Vishwatma', t: 'Saat Samundar Paar', hi: 'सात समुंदर पार' },
  { f: 'Yeh Dillagi', t: 'Ole Ole', hi: 'ओले ओले' },
  { f: 'Jaane Tu... Ya Jaane Na', t: 'Kabhi Kabhi Aditi', hi: 'कभी कभी अदिति' },
  { f: 'War', t: 'Ghungroo', hi: 'घुंघरू' },
  { f: 'Tiger Zinda Hai', t: 'Swag Se Swagat', hi: 'स्वैग से स्वागत' },
  { f: 'Ae Dil Hai Mushkil', t: 'The Breakup Song', hi: 'द ब्रेकअप सॉन्ग' },
  { f: 'Sonu Ke Titu Ki Sweety', t: 'Bom Diggy Diggy', hi: 'बॉम डिगी डिगी' },
  { f: 'Ek Villain', t: 'Galliyan', hi: 'गलियाँ' },
  { f: 'Student of the Year', t: 'Ishq Wala Love', hi: 'इश्क़ वाला लव' },
  { f: 'Woh Kaun Thi?', t: 'Lag Ja Gale', hi: 'लग जा गले' },
  { f: 'Don', t: 'Khaike Paan Banaraswala', hi: 'खइके पान बनारसवाला' },
  { f: 'Mr. India', t: 'Hawa Hawai', hi: 'हवा हवाई' },
  { f: 'Sholay', t: 'Yeh Dosti', hi: 'ये दोस्ती' },
  { f: 'Kismat', t: 'Kajra Mohabbat Wala', hi: 'कजरा मोहब्बत वाला' },
];

// The Tambola host (the Delhi tapori) introduces each song round.
const SONG_INTROS = [
  (t: string) => `गाना पहचानो… "${t}"! बताओ बताओ, किस फ़िल्म का है?`,
  (t: string) => `अब आया गाना… "${t}"! फ़िल्म का नाम बोलो!`,
  (t: string) => `ये गाना तो सबने सुना है… "${t}"! पर फ़िल्म कौन सी?`,
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Clip names inside public/audio/filmy. Stable across reordering, so re-recording stays cheap. */
export const dialogueClip = (d: Dialogue) => 'd-' + slug(d.f);
export const songClip = (s: Song) => 's-' + slug(s.t);

export function songIntro(s: Song): string {
  let h = 0;
  for (let i = 0; i < s.t.length; i++) h += s.t.charCodeAt(i);
  return SONG_INTROS[h % SONG_INTROS.length](s.hi);
}

/** What a clip says (for the generator, and the browser's speech fallback). */
export function filmyClipText(file: string): string {
  const d = DIALOGUES.find((x) => dialogueClip(x) === file);
  if (d) return d.hi;
  const s = SONGS.find((x) => songClip(x) === file);
  return s ? songIntro(s) : '';
}
