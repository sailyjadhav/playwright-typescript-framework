// Terms whose results all contain the term in the product name. The site's search also matches
// categories (for example "Top" returns shirts filed under Tops), so terms like that are left out.
import type { TestTag } from '../utils/test-tags';

export type SearchTerm = {
  term: string;
  // Optional tags for the generated test, for example ['@smoke'].
  tags?: TestTag[];
};

export const termsMatchingProductNames: SearchTerm[] = [
  { term: 'Jeans', tags: ['@smoke'] },
  { term: 'Saree' },
  { term: 'Polo' },
  { term: 'Blue' },
];

export const termWithNoResults = 'zzznotaproduct';
