// All works are public domain, from the Art Institute of Chicago open-access collection.
export type Tradition =
  | "Old Masters"
  | "Romantic & Realist"
  | "Impressionism"
  | "Post-Impressionism"
  | "Modern & Abstract"
  | "Asian traditions";

export type Subject = "Landscape" | "People" | "Still life" | "Everyday scene" | "Sacred & myth" | "Abstract";

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  tradition: Tradition;
  subject: Subject;
  /** 0 = lifelike, 1 = fully abstract */
  abstraction: number;
  /** 0 = muted / dark, 1 = vivid colour */
  vivid: number;
}

const a = (
  id: number, title: string, artist: string, year: string,
  tradition: Tradition, subject: Subject, abstraction: number, vivid: number,
): Artwork => ({ id: String(id), title, artist, year, tradition, subject, abstraction, vivid });

export const ARTWORKS: Artwork[] = [
  a(87479, "The Assumption of the Virgin", "El Greco", "1577–79", "Old Masters", "Sacred & myth", 0.3, 0.7),
  a(95998, "Old Man with a Gold Chain", "Rembrandt van Rijn", "1631", "Old Masters", "People", 0.05, 0.1),
  a(80530, "Virgin and Child with an Angel", "Sandro Botticelli", "1475–85", "Old Masters", "Sacred & myth", 0.15, 0.5),
  a(66042, "Trompe-l'Oeil Still Life with a Flower Garland and a Curtain", "Adriaen van der Spelt", "1658", "Old Masters", "Still life", 0.0, 0.6),
  a(22857, "The Garden of Paradise", "Workshop of Hieronymus Bosch", "c. 1500–20", "Old Masters", "Sacred & myth", 0.3, 0.5),
  a(51577, "The White Tablecloth", "Jean Siméon Chardin", "c. 1731–32", "Old Masters", "Still life", 0.15, 0.15),

  a(4796, "Fishing Boats with Hucksters Bargaining for Fish", "J. M. W. Turner", "1837–38", "Romantic & Realist", "Landscape", 0.35, 0.35),
  a(25865, "The Herring Net", "Winslow Homer", "1885", "Romantic & Realist", "Everyday scene", 0.15, 0.15),
  a(56905, "Nocturne: Blue and Gold—Southampton Water", "James McNeill Whistler", "1872", "Romantic & Realist", "Landscape", 0.55, 0.15),
  a(90048, "Distant View of Niagara Falls", "Thomas Cole", "1830", "Romantic & Realist", "Landscape", 0.1, 0.5),
  a(110663, "The Combat of the Giaour and Hassan", "Eugène Delacroix", "1826", "Romantic & Realist", "Sacred & myth", 0.25, 0.6),

  a(16568, "Water Lilies", "Claude Monet", "1906", "Impressionism", "Landscape", 0.55, 0.55),
  a(20684, "Paris Street; Rainy Day", "Gustave Caillebotte", "1877", "Impressionism", "Everyday scene", 0.1, 0.2),
  a(111442, "The Child's Bath", "Mary Cassatt", "1893", "Impressionism", "People", 0.3, 0.5),
  a(14655, "Two Sisters (On the Terrace)", "Pierre-Auguste Renoir", "1881", "Impressionism", "People", 0.3, 0.85),

  a(27992, "A Sunday on La Grande Jatte — 1884", "Georges Seurat", "1884–86", "Post-Impressionism", "Everyday scene", 0.45, 0.7),
  a(28560, "The Bedroom", "Vincent van Gogh", "1889", "Post-Impressionism", "Everyday scene", 0.5, 0.85),
  a(111436, "The Basket of Apples", "Paul Cezanne", "c. 1893", "Post-Impressionism", "Still life", 0.45, 0.5),
  a(27943, "Mahana no atua (Day of the God)", "Paul Gauguin", "1894", "Post-Impressionism", "Sacred & myth", 0.6, 0.95),
  a(154235, "The Girl by the Window", "Edvard Munch", "1893", "Post-Impressionism", "People", 0.45, 0.15),
  a(94241, "The Red Room, Etretat", "Félix Vallotton", "1899", "Post-Impressionism", "Everyday scene", 0.4, 0.8),

  a(8991, "Improvisation No. 30 (Cannons)", "Vasily Kandinsky", "1913", "Modern & Abstract", "Abstract", 0.9, 0.9),
  a(109819, "Lozenge Composition with Yellow, Black, Blue, Red, and Gray", "Piet Mondrian", "1921", "Modern & Abstract", "Abstract", 1.0, 0.5),
  a(65916, "Movement", "Marsden Hartley", "1913", "Modern & Abstract", "Abstract", 0.95, 0.9),
  a(9021, "The Bewitched Mill", "Franz Marc", "1913", "Modern & Abstract", "Landscape", 0.75, 0.95),
  a(27984, "Woman before an Aquarium", "Henri Matisse", "1921–23", "Modern & Abstract", "People", 0.5, 0.4),

  a(24645, "Under the Wave off Kanagawa (The Great Wave)", "Katsushika Hokusai", "1830–33", "Asian traditions", "Landscape", 0.5, 0.45),
  a(22719, "Sudden Shower at Mimeguri Shrine", "Torii Kiyonaga", "c. 1787", "Asian traditions", "Everyday scene", 0.5, 0.35),
  a(75538, "Landscape after Huang Gongwang", "Wang Yuanqi", "1701", "Asian traditions", "Landscape", 0.5, 0.05),
  a(49195, "Maharana Bhim Singh in Procession", "Ghasi", "c. 1820", "Asian traditions", "Everyday scene", 0.45, 0.75),
];

export const imageUrl = (art: Artwork) => `./art/${art.id}.jpg`;
