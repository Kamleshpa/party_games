import type { GameId } from '../shared/types';
import type { GameModule } from './types';
import { tambola } from './tambola/engine';
import { emoji } from './emoji/engine';
import { quiz } from './quiz/engine';
import { filmy } from './filmy/engine';

export const MODULES: Record<GameId, GameModule> = { tambola, emoji, quiz, filmy };

export interface SettingOption {
  key: string;
  label: string;
  choices: { value: any; label: string }[];
}

export interface GameMeta {
  id: GameId;
  title: string;
  tagline: string;
  icon: string;
  accent: string;
  rules: string[];
  options: SettingOption[];
  minutes: string;
}

export const GAME_META: Record<GameId, GameMeta> = {
  tambola: {
    id: 'tambola',
    title: 'Tambola Night',
    tagline: 'Housie on the big screen — tickets on your phone!',
    icon: '🎟️',
    accent: '#ffb703',
    minutes: '12–15 min',
    rules: [
      'Your ticket is on your phone — tap numbers as they’re called',
      'Claim Early Five, the three Lines, Four Corners and Full House',
      'False claim = BOGEY 🚨 and 3 numbers in jail',
      'For kids: turn on “Auto-mark”',
    ],
    options: [
      {
        key: 'speed',
        label: 'Speed',
        choices: [
          { value: 'slow', label: '🐢 Relaxed' },
          { value: 'normal', label: '🚶 Normal' },
          { value: 'fast', label: '🚀 Fast' },
        ],
      },
      {
        key: 'tickets',
        label: 'Tickets',
        choices: [
          { value: 1, label: '1 ticket' },
          { value: 2, label: '2 tickets' },
        ],
      },
    ],
  },
  emoji: {
    id: 'emoji',
    title: 'Emoji Movie',
    tagline: 'Guess the film from the emojis!',
    icon: '🎬',
    accent: '#ff4d8d',
    minutes: '8–10 min',
    rules: [
      'Emojis appear on the TV one by one — guess the movie',
      'Lock in early for more points',
      'Wrong answer = zero, so think before you tap!',
      '💡 2 hints per game — but they halve your points',
    ],
    options: [
      {
        key: 'cat',
        label: 'Movies',
        choices: [
          { value: 'mix', label: '🍿 Mix' },
          { value: 'bolly', label: '🇮🇳 Bollywood only' },
          { value: 'kids', label: '🧸 Kids & Hollywood' },
        ],
      },
      {
        key: 'rounds',
        label: 'Questions',
        choices: [
          { value: 8, label: '8' },
          { value: 12, label: '12' },
          { value: 16, label: '16' },
        ],
      },
    ],
  },
  filmy: {
    id: 'filmy',
    title: 'Filmy Dialogues',
    tagline: 'Hear the dialogue, name the film!',
    icon: '🎙️',
    accent: '#c77dff',
    minutes: '8–10 min',
    rules: [
      '🔊 The TV plays a famous film dialogue — which movie is it?',
      'Missed it? It plays once more, with subtitles',
      '🎵 Song rounds: which film is the song from?',
      'Lock in early for more points · 💡 2 hints per game',
    ],
    options: [
      {
        key: 'mode',
        label: 'Rounds',
        choices: [
          { value: 'mix', label: '🍿 Mix' },
          { value: 'dialogues', label: '🎙️ Dialogues only' },
          { value: 'songs', label: '🎵 Songs only' },
        ],
      },
      {
        key: 'rounds',
        label: 'Questions',
        choices: [
          { value: 8, label: '8' },
          { value: 12, label: '12' },
          { value: 16, label: '16' },
        ],
      },
    ],
  },
  quiz: {
    id: 'quiz',
    title: '90s Kids Quiz',
    tagline: 'From Doordarshan to dial-up',
    icon: '📼',
    accent: '#4cc9f0',
    minutes: '8–10 min',
    rules: [
      'Questions on the TV, answers on your phone',
      'Faster correct answers = more points, plus streak bonuses 🔥',
      'True or False, and Guess the Year — the closer, the more points',
      'Last 2 questions: DOUBLE POINTS 💥',
    ],
    options: [
      {
        key: 'rounds',
        label: 'Questions',
        choices: [
          { value: 8, label: '8' },
          { value: 12, label: '12' },
          { value: 16, label: '16' },
        ],
      },
    ],
  },
};

export const GAME_ORDER: GameId[] = ['tambola', 'emoji', 'filmy', 'quiz'];
