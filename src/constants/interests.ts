/**
 * Interests Categories and Options
 */

export interface Interest {
  id: string;
  label: string;
  emoji: string;
}

export interface InterestCategory {
  id: string;
  label: string;
  interests: Interest[];
}

export const InterestCategories: InterestCategory[] = [
  {
    id: 'food_drink',
    label: 'Food & Drink',
    interests: [
      { id: 'coffee', label: 'Coffee', emoji: '☕' },
      { id: 'cooking', label: 'Cooking', emoji: '🍳' },
      { id: 'dining_out', label: 'Dining Out', emoji: '🍽️' },
      { id: 'baking', label: 'Baking', emoji: '🧁' },
      { id: 'wine', label: 'Wine', emoji: '🍷' },
      { id: 'craft_beer', label: 'Craft Beer', emoji: '🍺' },
      { id: 'food_photography', label: 'Food Photography', emoji: '📸' },
    ],
  },
  {
    id: 'fitness',
    label: 'Fitness & Sports',
    interests: [
      { id: 'running', label: 'Running', emoji: '🏃' },
      { id: 'yoga', label: 'Yoga', emoji: '🧘' },
      { id: 'hiking', label: 'Hiking', emoji: '🥾' },
      { id: 'cycling', label: 'Cycling', emoji: '🚴' },
      { id: 'swimming', label: 'Swimming', emoji: '🏊' },
      { id: 'gym', label: 'Gym', emoji: '💪' },
      { id: 'tennis', label: 'Tennis', emoji: '🎾' },
      { id: 'basketball', label: 'Basketball', emoji: '🏀' },
      { id: 'soccer', label: 'Soccer', emoji: '⚽' },
      { id: 'climbing', label: 'Climbing', emoji: '🧗' },
    ],
  },
  {
    id: 'creative',
    label: 'Creative & Arts',
    interests: [
      { id: 'photography', label: 'Photography', emoji: '📷' },
      { id: 'painting', label: 'Painting', emoji: '🎨' },
      { id: 'music', label: 'Music', emoji: '🎵' },
      { id: 'writing', label: 'Writing', emoji: '✍️' },
      { id: 'crafts', label: 'Crafts', emoji: '🎭' },
      { id: 'design', label: 'Design', emoji: '🖌️' },
      { id: 'film', label: 'Film', emoji: '🎬' },
    ],
  },
  {
    id: 'learning',
    label: 'Learning & Growth',
    interests: [
      { id: 'languages', label: 'Languages', emoji: '🗣️' },
      { id: 'reading', label: 'Reading', emoji: '📚' },
      { id: 'technology', label: 'Technology', emoji: '💻' },
      { id: 'history', label: 'History', emoji: '🏛️' },
      { id: 'science', label: 'Science', emoji: '🔬' },
      { id: 'philosophy', label: 'Philosophy', emoji: '💭' },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    interests: [
      { id: 'board_games', label: 'Board Games', emoji: '🎲' },
      { id: 'video_games', label: 'Video Games', emoji: '🎮' },
      { id: 'movies', label: 'Movies', emoji: '🎥' },
      { id: 'anime', label: 'Anime', emoji: '🎌' },
      { id: 'concerts', label: 'Concerts', emoji: '🎤' },
      { id: 'theater', label: 'Theater', emoji: '🎭' },
      { id: 'trivia', label: 'Trivia', emoji: '❓' },
    ],
  },
  {
    id: 'outdoors',
    label: 'Outdoors & Nature',
    interests: [
      { id: 'camping', label: 'Camping', emoji: '🏕️' },
      { id: 'gardening', label: 'Gardening', emoji: '🌱' },
      { id: 'photography_nature', label: 'Nature Photography', emoji: '🌿' },
      { id: 'bird_watching', label: 'Bird Watching', emoji: '🦜' },
      { id: 'beach', label: 'Beach', emoji: '🏖️' },
      { id: 'stargazing', label: 'Stargazing', emoji: '⭐' },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    interests: [
      { id: 'networking', label: 'Networking', emoji: '🤝' },
      { id: 'volunteering', label: 'Volunteering', emoji: '💝' },
      { id: 'travel', label: 'Travel', emoji: '✈️' },
      { id: 'pets', label: 'Pets', emoji: '🐾' },
      { id: 'parenting', label: 'Parenting', emoji: '👶' },
    ],
  },
];

// Flatten all interests for easy lookup
export const AllInterests: Interest[] = InterestCategories.flatMap(
  (category) => category.interests
);

// Get interest by ID
export const getInterestById = (id: string): Interest | undefined =>
  AllInterests.find((interest) => interest.id === id);

export default InterestCategories;
