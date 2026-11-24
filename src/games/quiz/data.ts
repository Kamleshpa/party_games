// 90s Kids Quiz content. For mcq, the FIRST option is the correct one (options get shuffled).
// tf: a = true means "True". year: a = the year. f = fun fact shown at the reveal.
export type QuizCat = 'tv' | 'ads' | 'cricket' | 'filmi' | 'music' | 'bachpan' | 'tech';

export const CATS: Record<QuizCat, { name: string; icon: string }> = {
  tv: { name: 'TV & Doordarshan', icon: '📺' },
  ads: { name: 'Ads & Jingles', icon: '📢' },
  cricket: { name: 'Cricket', icon: '🏏' },
  filmi: { name: 'Bollywood', icon: '🎬' },
  music: { name: 'Indipop & Music', icon: '🎵' },
  bachpan: { name: 'Childhood & Comics', icon: '🍬' },
  tech: { name: 'Tech & Gadgets', icon: '💾' },
};

export type QuizItem =
  | { k: 'mcq'; c: QuizCat; q: string; o: string[]; f?: string }
  | { k: 'tf'; c: QuizCat; q: string; a: boolean; f?: string }
  | { k: 'year'; c: QuizCat; q: string; a: number; f?: string };

export const QUIZ: QuizItem[] = [
  // ---------- TV & Doordarshan ----------
  { k: 'mcq', c: 'tv', q: "What was Shaktimaan's secret-identity name?", o: ['Pandit Gangadhar', 'Pandit Girdhari', 'Master Gajodhar', 'Pandit Gangaram'], f: 'Full name: Gangadhar Vidyadhar Mayadhar Omkarnath Shastri!' },
  { k: 'mcq', c: 'tv', q: '"Andheraa kaayam rahe!" — which Shaktimaan villain said it?', o: ['Tamraj Kilvish', 'Dr. Jackaal', 'Mogambo', 'Shakaal'] },
  { k: 'mcq', c: 'tv', q: 'In 1987–88, why were the streets empty on Sunday mornings?', o: ['Ramayan', 'Hum Log', 'Buniyaad', 'Chitrahaar'], f: "Ramanand Sagar's Ramayan — the whole neighbourhood around one TV!" },
  { k: 'mcq', c: 'tv', q: '"Yakku!" was whose catchphrase?', o: ['Krur Singh (Chandrakanta)', 'Kilvish (Shaktimaan)', 'Gabbar (Sholay)', 'Mogambo (Mr. India)'] },
  { k: 'mcq', c: 'tv', q: 'What was the name of the boy hero of Malgudi Days?', o: ['Swami', 'Raju', 'Chhotu', 'Mowgli'], f: "Based on R.K. Narayan's stories, directed by Shankar Nag." },
  { k: 'mcq', c: 'tv', q: '"Jungle Jungle Baat Chali Hai" was the title song of which cartoon?', o: ['The Jungle Book', 'DuckTales', 'TaleSpin', 'He-Man'], f: 'Lyrics by Gulzar — still stuck in your head?' },
  { k: 'mcq', c: 'tv', q: 'Which cartoon starred Scrooge McDuck and his three nephews?', o: ['DuckTales', 'TaleSpin', 'Captain Planet', 'Tom & Jerry'] },
  { k: 'mcq', c: 'tv', q: 'Who was Byomkesh Bakshi?', o: ['A detective', 'A police inspector', 'A lawyer', 'A doctor'] },
  { k: 'mcq', c: 'tv', q: 'Detective Karamchand was always munching on what?', o: ['Carrots', 'Radish', 'Cucumber', 'Paan'], f: 'Pankaj Kapur — "Shut up, Kitty!"' },
  { k: 'mcq', c: 'tv', q: 'Who hosted Zee TV\'s "Antakshari"?', o: ['Annu Kapoor', 'Shekhar Suman', 'Javed Jaffrey', 'Farooq Shaikh'] },
  { k: 'mcq', c: 'tv', q: 'Who hosted the show "Surabhi"?', o: ['Renuka Shahane & Siddharth Kak', 'Annu Kapoor & Durga Jasraj', 'Shekhar Suman & Sonu Walia', 'Tabassum & Javed Jaffrey'], f: 'They got sackfuls of postcards every week!' },
  { k: 'mcq', c: 'tv', q: 'When was "Rangoli" on Doordarshan?', o: ['Sunday morning', 'Wednesday night', 'Saturday evening', 'Every afternoon'] },
  { k: 'mcq', c: 'tv', q: 'What did "Chitrahaar" show?', o: ['Film songs', 'The news', 'Cartoons', 'Cricket highlights'] },
  { k: 'mcq', c: 'tv', q: '"Hum Log" (1984) is known as…', o: ["India's first TV soap opera", 'The first colour TV show', 'The first cartoon', 'The first reality show'] },
  { k: 'mcq', c: 'tv', q: '"Tu Tu Main Main" was about which relationship?', o: ['Mother-in-law & daughter-in-law', 'Husband & wife', 'Brother & sister', 'Neighbours'] },
  { k: 'mcq', c: 'tv', q: 'Who played Mussaddi Lal in "Office Office"?', o: ['Pankaj Kapur', 'Satish Shah', 'Shekhar Suman', 'Farooq Shaikh'] },
  { k: 'mcq', c: 'tv', q: 'What was "Hip Hip Hurray" (1998) about?', o: ['School kids', 'A cricket team', 'Girls in a hostel', 'Army cadets'] },
  { k: 'mcq', c: 'tv', q: 'Which channel aired Shaktimaan?', o: ['Doordarshan', 'Zee TV', 'Star Plus', 'Sony'] },
  { k: 'mcq', c: 'tv', q: 'What did the Doordarshan logo look like?', o: ['A spinning eye', 'A rising sun', 'A lotus', 'A dancing peacock'] },

  // ---------- Ads & Jingles ----------
  { k: 'mcq', c: 'ads', q: 'Complete the jingle: "Washing powder ___!"', o: ['Nirma', 'Surf', 'Wheel', 'Ariel'] },
  { k: 'mcq', c: 'ads', q: '"Buland Bharat ki buland tasveer" — which brand?', o: ['Hamara Bajaj', 'Hero Honda', 'Maruti', 'LML Vespa'] },
  { k: 'mcq', c: 'ads', q: '"I love you ___!" — which drink?', o: ['Rasna', 'Gold Spot', 'Frooti', 'Tang'] },
  { k: 'mcq', c: 'ads', q: 'Lalitaji taught "smart shopping" for which product?', o: ['Surf', 'Nirma', 'Rin', 'Tide'] },
  { k: 'mcq', c: 'ads', q: 'In the famous 90s Cadbury Dairy Milk ad, what happens at the cricket ground?', o: ['A girl dances onto the field', 'Sachin eats a chocolate', 'The umpire steals a chocolate', 'Kids look for the ball'], f: '"Kuch khaas hai..." — 1994' },
  { k: 'mcq', c: 'ads', q: 'Complete: "Jo biwi se kare pyaar, woh ___ se kaise kare inkaar?"', o: ['Prestige', 'Hawkins', 'Pigeon', 'Butterfly'] },
  { k: 'mcq', c: 'ads', q: '"___ turmeric, nahin cosmetic" — which brand?', o: ['Vicco', 'Boroline', 'Fair & Lovely', 'Himalaya'] },
  { k: 'mcq', c: 'ads', q: 'What is the Lijjat Papad mascot?', o: ['A bunny', 'A monkey', 'A cat', 'A parrot'], f: 'Karram kurram, kurram karram!' },
  { k: 'mcq', c: 'ads', q: '"Melody itni chocolatey kyun hai?" — what\'s the answer?', o: ['Melody khao, khud jaan jao', 'Because it has milk', "It's a secret recipe", 'Ask your mummy'] },
  { k: 'mcq', c: 'ads', q: 'Complete: "Thanda matlab ___"', o: ['Coca-Cola', 'Pepsi', 'Thums Up', 'Limca'], f: "Aamir Khan's Hyderabadi avatar, 2003." },
  { k: 'mcq', c: 'ads', q: 'The girl bathing under a waterfall — which soap ad?', o: ['Liril', 'Lux', 'Cinthol', 'Hamam'] },
  { k: 'mcq', c: 'ads', q: '"Taste the Thunder" is whose tagline?', o: ['Thums Up', 'Pepsi', 'Coca-Cola', 'Mountain Dew'] },
  { k: 'mcq', c: 'ads', q: '"Dimaag ki batti jala de" — which candy?', o: ['Mentos', 'Alpenliebe', 'Eclairs', 'Pulse'] },
  { k: 'mcq', c: 'ads', q: '"The Taste of India" is whose tagline?', o: ['Amul', 'Britannia', 'Parle', 'Haldiram'] },
  { k: 'mcq', c: 'ads', q: 'Which cricketer said "Boost is the secret of my energy" in the 90s?', o: ['Sachin Tendulkar', 'Sourav Ganguly', 'Mohammad Azharuddin', 'Rahul Dravid'] },
  { k: 'mcq', c: 'ads', q: '"Dhoondte reh jaoge!" — which ad?', o: ['Surf Excel', 'Nirma', 'Rin', 'Ariel'] },

  // ---------- Cricket ----------
  { k: 'mcq', c: 'cricket', q: 'Who played the 1998 "Desert Storm" innings in Sharjah?', o: ['Sachin Tendulkar', 'Sourav Ganguly', 'Ajay Jadeja', 'Mohammad Azharuddin'], f: 'A real sandstorm — and then Australia got thrashed!' },
  { k: 'mcq', c: 'cricket', q: 'In 1999, Anil Kumble took all 10 wickets in an innings against…', o: ['Pakistan', 'Australia', 'Sri Lanka', 'England'], f: 'Feroz Shah Kotla, Delhi.' },
  { k: 'mcq', c: 'cricket', q: 'Who captained India to the 1983 World Cup win?', o: ['Kapil Dev', 'Sunil Gavaskar', 'Mohinder Amarnath', 'Ravi Shastri'] },
  { k: 'mcq', c: 'cricket', q: 'Who beat India in the 1996 World Cup semi-final at Eden Gardens?', o: ['Sri Lanka', 'Australia', 'Pakistan', 'West Indies'] },
  { k: 'mcq', c: 'cricket', q: '"Jumbo" was whose nickname?', o: ['Anil Kumble', 'Javagal Srinath', 'Venkatesh Prasad', 'Harbhajan Singh'] },
  { k: 'mcq', c: 'cricket', q: 'Who is called "The Wall"?', o: ['Rahul Dravid', 'VVS Laxman', 'Sachin Tendulkar', 'Sourav Ganguly'] },
  { k: 'mcq', c: 'cricket', q: "Who waved his shirt on the Lord's balcony?", o: ['Sourav Ganguly', 'Yuvraj Singh', 'Virender Sehwag', 'Zaheer Khan'], f: 'NatWest final, 2002.' },
  { k: 'mcq', c: 'cricket', q: 'Sachin made his international debut against…', o: ['Pakistan', 'New Zealand', 'Australia', 'West Indies'], f: 'Karachi, 1989 — at just 16!' },

  // ---------- Bollywood ----------
  { k: 'mcq', c: 'filmi', q: '"Mogambo khush hua!" — which film?', o: ['Mr. India', 'Tridev', 'Ram Lakhan', 'Karma'] },
  { k: 'mcq', c: 'filmi', q: '"Kitne aadmi the?" — who asks this?', o: ['Gabbar Singh', 'Mogambo', 'Shakaal', 'Kancha Cheena'] },
  { k: 'mcq', c: 'filmi', q: 'What was the dog\'s name in "Hum Aapke Hain Koun..!"?', o: ['Tuffy', 'Moti', 'Tommy', 'Sheru'] },
  { k: 'mcq', c: 'filmi', q: 'What was Shah Rukh\'s name in "Kuch Kuch Hota Hai"?', o: ['Rahul', 'Raj', 'Aman', 'Rohit'] },
  { k: 'mcq', c: 'filmi', q: 'What did Aamir Khan do for a living in "Raja Hindustani"?', o: ['Taxi driver', 'Tonga driver', 'Porter', 'Mechanic'] },
  { k: 'mcq', c: 'filmi', q: '"Mere Karan Arjun aayenge" — who says it?', o: ['Raakhee', 'Nirupa Roy', 'Waheeda Rehman', 'Reema Lagoo'] },
  { k: 'mcq', c: 'filmi', q: '"Mere paas maa hai" — which film?', o: ['Deewaar', 'Trishul', 'Zanjeer', 'Sholay'] },
  { k: 'mcq', c: 'filmi', q: '"Pushpa, I hate tears" — which superstar?', o: ['Rajesh Khanna', 'Amitabh Bachchan', 'Dharmendra', 'Dev Anand'] },
  { k: 'mcq', c: 'filmi', q: '"Bade bade deshon mein aisi chhoti chhoti baatein..." — who says it?', o: ['Shah Rukh Khan', 'Salman Khan', 'Aamir Khan', 'Saif Ali Khan'], f: "DDLJ, 1995 — Raj's signature line!" },
  { k: 'mcq', c: 'filmi', q: 'Who composed the music for "Roja" (1992)?', o: ['A.R. Rahman', 'Ilaiyaraaja', 'Anu Malik', 'Nadeem-Shravan'], f: "Rahman's very first film!" },
  { k: 'mcq', c: 'filmi', q: '"Ek chutki sindoor ki keemat..." — which film?', o: ['Om Shanti Om', 'Main Hoon Na', 'Devdas', 'Kabhi Alvida Naa Kehna'] },

  // ---------- Indipop & Music ----------
  { k: 'mcq', c: 'music', q: 'Who sang "Made in India" (1995)?', o: ['Alisha Chinai', 'Shweta Shetty', 'Suneeta Rao', 'Anaida'] },
  { k: 'mcq', c: 'music', q: 'Whose song is "Tunak Tunak Tun"?', o: ['Daler Mehndi', 'Sukhbir', 'Mika Singh', 'Gurdas Maan'] },
  { k: 'mcq', c: 'music', q: 'Who sang "Pari Hoon Main"?', o: ['Suneeta Rao', 'Alisha Chinai', 'Shweta Shetty', 'Mehnaz'] },
  { k: 'mcq', c: 'music', q: 'Who sang "Purani Jeans"?', o: ['Ali Haider', 'Lucky Ali', 'Sonu Nigam', 'Shaan'] },
  { k: 'mcq', c: 'music', q: 'Who sang the friendship anthem "Yaaron" (album "Pal")?', o: ['KK', 'Lucky Ali', 'Sonu Nigam', 'Shaan'] },
  { k: 'mcq', c: 'music', q: 'Whose song is "O Sanam" (1996)?', o: ['Lucky Ali', 'KK', 'Shaan', 'Hariharan'] },
  { k: 'mcq', c: 'music', q: '"Quick Gun Murugun" was a character on which music channel?', o: ['Channel V', 'MTV', 'Zee Music', 'DD Metro'] },

  // ---------- Childhood & Comics ----------
  { k: 'mcq', c: 'bachpan', q: 'When a cassette tape got tangled, what did you fix it with?', o: ['A pencil', 'A spoon', 'A toothbrush', 'A comb'] },
  { k: 'mcq', c: 'bachpan', q: 'What was a "BSA SLR"?', o: ['A bicycle', 'A scooter', 'A camera', 'A radio'] },
  { k: 'mcq', c: 'bachpan', q: 'What flavour was Gold Spot?', o: ['Orange', 'Lemon', 'Cola', 'Mango'], f: '"The Zing Thing!"' },
  { k: 'mcq', c: 'bachpan', q: 'What was Parle "Poppins"?', o: ['Fruit candy', 'A biscuit', 'Chips', 'A cold drink'] },
  { k: 'mcq', c: 'bachpan', q: "Chacha Chaudhary's brain worked faster than a…", o: ['Computer', 'Rocket', 'Cheetah', 'Calculator'] },
  { k: 'mcq', c: 'bachpan', q: "Which planet was Chacha Chaudhary's friend Sabu from?", o: ['Jupiter', 'Mars', 'Saturn', 'Pluto'], f: 'And when Sabu gets angry, a volcano erupts somewhere!' },
  { k: 'mcq', c: 'bachpan', q: 'Nagraj and Super Commando Dhruv belonged to which comics?', o: ['Raj Comics', 'Diamond Comics', 'Amar Chitra Katha', 'Tinkle'] },
  { k: 'mcq', c: 'bachpan', q: 'What was Suppandi from Tinkle like?', o: ['A simple-minded servant', 'A clever detective', 'King of the jungle', 'A robot'] },
  { k: 'mcq', c: 'bachpan', q: 'Which magazine featured "Shikari Shambhu"?', o: ['Tinkle', 'Champak', 'Chandamama', 'Nandan'] },

  // ---------- Tech & Gadgets ----------
  { k: 'mcq', c: 'tech', q: 'How much data fit on a 3.5-inch floppy disk?', o: ['1.44 MB', '100 MB', '1 GB', '14 KB'] },
  { k: 'mcq', c: 'tech', q: 'What was the most famous game on the Nokia 3310?', o: ['Snake', 'Tetris', 'Mario', 'Pac-Man'] },
  { k: 'mcq', c: 'tech', q: 'What happened when dial-up internet connected?', o: ['A weird "beeee-krrrr" noise', 'The phone rang', 'Music played', 'The TV switched off'] },
  { k: 'mcq', c: 'tech', q: "On Yahoo Messenger, what did you send to shake a friend's window?", o: ['BUZZ!', 'Poke', 'Nudge', 'Wink'] },
  { k: 'mcq', c: 'tech', q: 'Which company owned Orkut?', o: ['Google', 'Yahoo', 'Microsoft', 'Rediff'] },
  { k: 'mcq', c: 'tech', q: 'What made Mario grow bigger?', o: ['A mushroom', 'An apple', 'A star', 'A coin'] },
  { k: 'mcq', c: 'tech', q: 'Which company made the Walkman?', o: ['Sony', 'Philips', 'Panasonic', 'BPL'] },
  { k: 'mcq', c: 'tech', q: 'At a PCO booth, what did "STD" stand for?', o: ['Subscriber Trunk Dialling', 'Standard Telephone Dial', 'Super Trunk Dial', 'State Telephone Department'] },
  { k: 'mcq', c: 'tech', q: 'What was another name for a pager?', o: ['Beeper', 'Walkie', 'Buzzer', 'Ringer'] },

  // ---------- True or False ----------
  { k: 'tf', c: 'bachpan', q: 'Coca-Cola left India in 1977.', a: true, f: 'And came back in 1993.' },
  { k: 'tf', c: 'tv', q: 'Mahabharat aired on Doordarshan before Ramayan.', a: false, f: 'Ramayan 1987, Mahabharat 1988.' },
  { k: 'tf', c: 'cricket', q: "Sachin's first Test match was against Australia.", a: false, f: 'Against Pakistan, Karachi, 1989.' },
  { k: 'tf', c: 'filmi', q: 'Aishwarya Rai and Sushmita Sen both won international crowns in 1994.', a: true, f: 'Sushmita — Miss Universe, Aishwarya — Miss World!' },
  { k: 'tf', c: 'tech', q: 'The Nokia 3310 had a camera.', a: false },
  { k: 'tf', c: 'bachpan', q: 'Thums Up was originally launched by Parle.', a: true, f: 'In 1977, after Coca-Cola left.' },
  { k: 'tf', c: 'tv', q: '"Chandrakanta" aired on Doordarshan.', a: true },
  { k: 'tf', c: 'filmi', q: 'Sholay was released in 1980.', a: false, f: 'It was 1975!' },
  { k: 'tf', c: 'tv', q: 'Mukesh Khanna played Shaktimaan.', a: true, f: 'He was also Bhishma in Mahabharat!' },
  { k: 'tf', c: 'cricket', q: 'Kapil Dev scored a century in the 1983 World Cup final.', a: false, f: 'His famous 175* came against Zimbabwe in a group match.' },
  { k: 'tf', c: 'bachpan', q: 'Maggi noodles arrived in India in the 1980s.', a: true, f: '1983 — "just 2 minutes!"' },
  { k: 'tf', c: 'bachpan', q: "Raj Comics' Nagraj could shoot snakes from his wrists.", a: true },
  { k: 'tf', c: 'tv', q: "Malgudi Days was based on R.K. Narayan's stories.", a: true },
  { k: 'tf', c: 'filmi', q: "DDLJ's climax takes place in Switzerland.", a: false, f: 'At a railway station in Punjab — "Ja Simran ja!"' },
  { k: 'tf', c: 'tv', q: 'Colour TV broadcasts in India began with the 1982 Asian Games.', a: true, f: 'Delhi Asian Games, 1982.' },
  { k: 'tf', c: 'tv', q: 'Arun Govil played Ram in the Ramayan serial.', a: true },

  // ---------- Guess the Year ----------
  { k: 'year', c: 'tv', q: 'When did Ramanand Sagar\'s "Ramayan" start on Doordarshan?', a: 1987 },
  { k: 'year', c: 'filmi', q: 'When was DDLJ released?', a: 1995, f: "It ran at Mumbai's Maratha Mandir for over 1,000 weeks!" },
  { k: 'year', c: 'cricket', q: 'When did Sachin Tendulkar make his international debut?', a: 1989 },
  { k: 'year', c: 'bachpan', q: 'When did Coca-Cola return to India?', a: 1993 },
  { k: 'year', c: 'tech', q: 'When was the first mobile phone call made in India?', a: 1995, f: 'Kolkata to Delhi — made by Jyoti Basu.' },
  { k: 'year', c: 'filmi', q: 'When was "Titanic" released?', a: 1997 },
  { k: 'year', c: 'bachpan', q: 'When did the first Maruti 800 roll out?', a: 1983 },
  { k: 'year', c: 'tv', q: 'When did Shaktimaan first air?', a: 1997 },
  { k: 'year', c: 'tv', q: 'When did "Kaun Banega Crorepati" first air?', a: 2000 },
  { k: 'year', c: 'music', q: 'When was "Mile Sur Mera Tumhara" first shown?', a: 1988 },
  { k: 'year', c: 'tv', q: 'When did Zee TV launch?', a: 1992 },
  { k: 'year', c: 'filmi', q: 'When was "Hum Aapke Hain Koun..!" released?', a: 1994 },
  { k: 'year', c: 'filmi', q: 'When was "Lagaan" released?', a: 2001 },
  { k: 'year', c: 'tech', q: 'When was Google founded?', a: 1998 },
  { k: 'year', c: 'cricket', q: "When did Kapil Dev's team win the World Cup?", a: 1983 },
  { k: 'year', c: 'tech', q: 'When did the Nokia 3310 launch?', a: 2000 },
];
