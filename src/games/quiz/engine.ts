import { makeQuizModule, type RunQ } from '../common/quizRunner';
import { shuffle } from '../../lib/rand';
import { CATS, QUIZ, type QuizItem } from './data';

export interface QuizSettings {
  rounds: number;
}

export const TF_OPTIONS = ['True ✅', 'False ❌'];

function toRunQ(item: QuizItem): RunQ {
  const cat = CATS[item.c];
  const base = { cat: cat.name, icon: cat.icon, prompt: item.q, extra: item.f };
  if (item.k === 'mcq') {
    const options = shuffle(item.o);
    return { ...base, kind: 'mcq', options, correct: options.indexOf(item.o[0]), duration: 15000 };
  }
  if (item.k === 'tf') return { ...base, kind: 'tf', options: TF_OPTIONS, correct: item.a ? 0 : 1, duration: 10000 };
  return { ...base, kind: 'year', correct: item.a, duration: 20000 };
}

export function buildQuiz(settings: QuizSettings): RunQ[] {
  const n = settings.rounds;
  const years: QuizItem[] = shuffle(QUIZ.filter((q) => q.k === 'year')).slice(0, Math.max(1, Math.round(n * 0.17)));
  const tfs: QuizItem[] = shuffle(QUIZ.filter((q) => q.k === 'tf')).slice(0, Math.max(1, Math.round(n * 0.2)));
  const mcqs: QuizItem[] = shuffle(QUIZ.filter((q) => q.k === 'mcq')).slice(0, n - years.length - tfs.length);
  // Start with an easy multiple-choice warm-up, then mix the rest.
  const rest = shuffle(mcqs.slice(1).concat(tfs, years));
  const items = mcqs.slice(0, 1).concat(rest);
  return items.map((it, i) => ({ ...toRunQ(it), double: i >= items.length - 2 }));
}

export const quiz = makeQuizModule<QuizSettings>({
  game: 'quiz',
  defaults: { rounds: 12 },
  build: buildQuiz,
  hints: 0,
  introMs: 9000,
  boardEvery: 4,
  base: 500,
  speed: 500,
  botAccuracy: 0.55,
});
