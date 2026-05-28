/**
 * Russian typography helpers.
 *
 * Short prepositions and conjunctions (и, в, на, с, …) should not dangle at
 * the end of a line — they belong with the word they refer to. We replace the
 * space AFTER them with a non-breaking space so the browser keeps them glued
 * to the next word when it wraps the line.
 *
 * Single letters (any 1-char "word") are always glued. For 2-3 char words we
 * use a hand-picked list of the common Russian function words.
 */

const MULTI_CHAR_GLUE_WORDS = new Set([
  // 2 chars
  "во", "со", "об", "ко", "на", "по", "за", "от", "до", "из",
  "не", "ни", "но", "да", "же", "ли", "бы", "то", "уж",
  // 3 chars
  "обо", "для", "изо", "без", "над", "под", "при", "или",
  "как", "что", "это", "так", "уже", "ещё", "еще", "его", "ему",
  "был", "вот", "тут", "там"
]);

const NBSP = " ";

/**
 * Glue short Russian function words to the next word with a non-breaking space.
 * Idempotent — running it twice has the same effect as running it once.
 *
 * Uses a lookbehind so the preceding whitespace is NOT consumed by the match;
 * otherwise consecutive short words (e.g. "у нас и в …") wouldn't all match
 * because the boundary would be eaten by the previous replacement.
 */
export function applyRussianTypography(text: string): string {
  if (!text) {
    return text;
  }

  return text.replace(
    /(?<=^|\s)([A-Za-zА-Яа-яЁё]+) /gu,
    (match, word: string) => {
      const lower = word.toLowerCase();
      const isSingleChar = word.length === 1;
      const isGlueWord = isSingleChar || MULTI_CHAR_GLUE_WORDS.has(lower);

      if (!isGlueWord) {
        return match;
      }

      return `${word}${NBSP}`;
    }
  );
}
