import { makeQuizModule, type RunQ } from '../common/quizRunner';
import { shuffle } from '../../lib/rand';
import { DIALOGUES, FILMS, SONGS, dialogueClip, songClip } from './data';

export interface FilmySettings {
  rounds: number;
  mode: 'mix' | 'dialogues' | 'songs';
}

const DIALOGUE_MS = 25000;
const SONG_MS = 20000;

/** Three wrong films from roughly the same era, so the year alone doesn't give it away. */
function distractors(film: string): string[] {
  const y = FILMS[film].y;
  const near = shuffle(Object.keys(FILMS).filter((f) => f !== film))
    .sort((a, b) => Math.abs(FILMS[a].y - y) - Math.abs(FILMS[b].y - y))
    .slice(0, 9);
  return shuffle(near).slice(0, 3);
}

function question(film: string): Pick<RunQ, 'kind' | 'options' | 'correct' | 'extra' | 'hint'> {
  const options = shuffle([film].concat(distractors(film)));
  const info = `${FILMS[film].y} · ${FILMS[film].star}`;
  return { kind: 'mcq', options, correct: options.indexOf(film), extra: info, hint: info };
}

export function buildFilmyQuestions(settings: FilmySettings): RunQ[] {
  const n = settings.rounds;
  const nSongs = settings.mode === 'songs' ? n : settings.mode === 'dialogues' ? 0 : Math.floor(n / 2);
  const dialogues: RunQ[] = shuffle(DIALOGUES)
    .slice(0, n - nSongs)
    .map((d) => ({
      ...question(d.f),
      cat: 'Dialogue',
      icon: '🎙️',
      duration: DIALOGUE_MS,
      audio: 'filmy/' + dialogueClip(d),
      replay: true,
      quote: d.line,
      tr: d.en === d.line ? undefined : d.en,
    }));
  const songs: RunQ[] = shuffle(SONGS)
    .slice(0, nSongs)
    .map((s) => ({
      ...question(s.f),
      cat: 'Song round',
      icon: '🎵',
      duration: SONG_MS,
      audio: 'filmy/' + songClip(s),
      prompt: '“' + s.t + '”',
    }));
  // take turns: dialogue, song, dialogue… (any leftovers go at the end)
  const qs: RunQ[] = [];
  for (let i = 0; qs.length < dialogues.length + songs.length; i++) {
    if (dialogues[i]) qs.push(dialogues[i]);
    if (songs[i]) qs.push(songs[i]);
  }
  return qs.map((q, i) => ({ ...q, double: i >= qs.length - 2 }));
}

export const filmy = makeQuizModule<FilmySettings>({
  game: 'filmy',
  defaults: { rounds: 12, mode: 'mix' },
  build: buildFilmyQuestions,
  hints: 2,
  introMs: 12000,
  boardEvery: 4,
  base: 300,
  speed: 700,
  botAccuracy: 0.6,
  revealMs: 12000,
  boardMs: 10000,
  allInMs: 3000,
});
