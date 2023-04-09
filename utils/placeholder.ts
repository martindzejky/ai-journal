import { sample } from 'lodash-es';

const placeholders = [
    'Aspiring Writer',
    'Thoughtful Thinker',
    'Creative Mind',
    'Reflective Soul',
    'Curious Explorer',
    'Mindful Observer',
    'Dreamer',
    'Insightful Journaler',
    'Introspective Thinker',
    'Imaginative Writer',
];

export function getPlaceholderName() {
    return sample(placeholders) as string;
}

export function getPlaceholderEmail(name: string = getPlaceholderName()) {
    return name.toLowerCase().replace(' ', '.') + '@example.com';
}
