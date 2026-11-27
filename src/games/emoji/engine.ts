import { makeQuizModule, type RunQ } from '../common/quizRunner';
import { shuffle } from '../../lib/rand';
import { EMOJI_MOVIES, type EmojiCat } from './data';

export interface EmojiSettings {
  rounds: number;
  cat: 'mix' | 'bolly' | 'kids';
}

const CAT_LABEL: Record<EmojiCat, { name: string; icon: string }> = {
  classic: { name: 'Bollywood Classic', icon: '🎞️' },
  new: { name: 'Bollywood 2000+', icon: '🎬' },
  kids: { name: 'Kids & Hollywood', icon: '🧸' },
};

export function buildEmojiQuestions(settings: EmojiSettings): RunQ[] {
  const allowed: EmojiCat[] = settings.cat === 'kids' ? ['kids'] : settings.cat === 'bolly' ? ['classic', 'new'] : ['classic', 'new', 'kids'];
  const pool = shuffle(EMOJI_MOVIES.filter((m) => allowed.indexOf(m.c) >= 0));
  const chosen = pool.slice(0, Math.min(settings.rounds, pool.length));
  return chosen.map((m, i) => {
    const sameCat = EMOJI_MOVIES.filter((x) => x.c === m.c && x.a !== m.a);
    const distractors = shuffle(sameCat).slice(0, 3).map((x) => x.a);
    const options = shuffle([m.a].concat(distractors));
    return {
      kind: 'mcq',
      emojis: m.e,
      options,
      correct: options.indexOf(m.a),
      cat: CAT_LABEL[m.c].name,
      icon: CAT_LABEL[m.c].icon,
      extra: `${m.y} · ${m.h}`,
      hint: `${m.y} · ${m.h}`,
      double: i >= chosen.length - 2,
      duration: 30000,
    };
  });
}

export const emoji = makeQuizModule<EmojiSettings>({
  game: 'emoji',
  defaults: { rounds: 12, cat: 'mix' },
  build: buildEmojiQuestions,
  hints: 2,
  // relaxed pace: time to argue about the film, laugh at the answer, read the scores
  introMs: 12000,
  boardEvery: 4,
  base: 300,
  speed: 700,
  botAccuracy: 0.6,
  revealMs: 12000,
  boardMs: 10000,
  allInMs: 3000,
});
