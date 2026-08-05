import { User, Task, Solution, Badge, LeaderboardEntry } from '@/types';

export const mockBadges: Badge[] = [
  { id: '1', name: 'Первые шаги', description: 'Выполните первое задание', icon: '🎯', earnedAt: new Date() },
  { id: '2', name: 'Ревьюер недели', description: 'Проверьте 10 заданий за неделю', icon: '⭐', earnedAt: new Date() },
  { id: '3', name: 'Серия 7', description: 'Проверяйте задания 7 дней подряд', icon: '🔥', earnedAt: new Date() },
  { id: '4', name: 'Эксперт Python', description: 'Проверьте 50 Python заданий', icon: '🐍', earnedAt: new Date() },
  { id: '5', name: 'Честный судья', description: 'Ваш рейтинг доверия выше 95%', icon: '⚖️', earnedAt: new Date() },
];

export const mockUser: User = {
  id: '1',
  nickname: 'CodeMaster',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeMaster',
  trustRating: 94,
  reviewBalance: 3,
  reviewsCompleted: 47,
  level: 'reviewer',
  streak: 5,
  badges: mockBadges.slice(0, 3),
  joinedAt: new Date('2024-01-15'),
};

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Палиндром',
    description: 'Напишите функцию, которая проверяет, является ли строка палиндромом. Палиндром — это слово или фраза, которые читаются одинаково слева направо и справа налево.',
    difficulty: 'easy',
    language: 'javascript',
    completions: 234,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'Сортировка массива',
    description: 'Реализуйте алгоритм быстрой сортировки (Quick Sort) для массива чисел. Функция должна сортировать массив по возрастанию.',
    difficulty: 'medium',
    language: 'python',
    completions: 156,
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    title: 'Бинарное дерево поиска',
    description: 'Создайте класс бинарного дерева поиска с методами вставки, удаления и поиска элементов.',
    difficulty: 'hard',
    language: 'typescript',
    completions: 89,
    createdAt: new Date('2024-01-14'),
  },
  {
    id: '4',
    title: 'CSS Flexbox Layout',
    description: 'Создайте адаптивную галерею изображений с использованием CSS Flexbox. Галерея должна корректно отображаться на всех устройствах.',
    difficulty: 'easy',
    language: 'css',
    completions: 312,
    createdAt: new Date('2024-01-08'),
  },
  {
    id: '5',
    title: 'Форма регистрации',
    description: 'Создайте HTML-форму регистрации с валидацией полей: email, пароль, подтверждение пароля. Используйте семантическую разметку.',
    difficulty: 'easy',
    language: 'html',
    completions: 445,
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    title: 'Асинхронный обработчик',
    description: 'Реализуйте функцию, которая параллельно выполняет несколько API-запросов и возвращает результаты в определенном порядке.',
    difficulty: 'medium',
    language: 'javascript',
    completions: 178,
    createdAt: new Date('2024-01-11'),
  },
  {
    id: '7',
    title: 'Графы и обходы',
    description: 'Реализуйте алгоритмы обхода графа в глубину (DFS) и в ширину (BFS). Граф представлен списком смежности.',
    difficulty: 'hard',
    language: 'python',
    completions: 67,
    createdAt: new Date('2024-01-13'),
  },
  {
    id: '8',
    title: 'Генератор паролей',
    description: 'Создайте генератор надежных паролей с настраиваемой длиной и набором символов (буквы, цифры, спецсимволы).',
    difficulty: 'medium',
    language: 'typescript',
    completions: 203,
    createdAt: new Date('2024-01-09'),
  },
];

export const mockSolutionToReview: Solution = {
  id: 'sol-1',
  taskId: '1',
  userId: 'user-2',
  code: `function isPalindrome(str) {
  // Удаляем пробелы и приводим к нижнему регистру
  const cleaned = str.toLowerCase().replace(/\\s/g, '');
  
  // Сравниваем с перевернутой строкой
  const reversed = cleaned.split('').reverse().join('');
  
  return cleaned === reversed;
}

// Примеры использования
console.log(isPalindrome("А роза упала на лапу Азора")); // true
console.log(isPalindrome("Hello")); // false`,
  status: 'pending',
  reviews: [],
  submittedAt: new Date(),
};

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: '10',
      nickname: 'AlgoKing',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlgoKing',
      trustRating: 98,
      reviewBalance: 12,
      reviewsCompleted: 234,
      level: 'expert',
      streak: 21,
      badges: mockBadges,
      joinedAt: new Date('2023-06-01'),
    },
    score: 2340,
  },
  {
    rank: 2,
    user: {
      id: '11',
      nickname: 'PyMaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PyMaster',
      trustRating: 96,
      reviewBalance: 8,
      reviewsCompleted: 189,
      level: 'expert',
      streak: 14,
      badges: mockBadges.slice(0, 4),
      joinedAt: new Date('2023-08-15'),
    },
    score: 1890,
  },
  {
    rank: 3,
    user: {
      id: '12',
      nickname: 'JSNinja',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JSNinja',
      trustRating: 95,
      reviewBalance: 5,
      reviewsCompleted: 156,
      level: 'reviewer',
      streak: 9,
      badges: mockBadges.slice(0, 3),
      joinedAt: new Date('2023-09-20'),
    },
    score: 1560,
  },
  {
    rank: 4,
    user: mockUser,
    score: 470,
  },
  {
    rank: 5,
    user: {
      id: '13',
      nickname: 'MoksuHub',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MoksuHub',
      trustRating: 91,
      reviewBalance: 2,
      reviewsCompleted: 98,
      level: 'reviewer',
      streak: 3,
      badges: mockBadges.slice(0, 2),
      joinedAt: new Date('2023-11-01'),
    },
    score: 980,
  },
];
