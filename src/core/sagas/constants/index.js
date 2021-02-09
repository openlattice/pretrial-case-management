/*
 * @flow
 */

export const SIMPLE_SEARCH = [{ constraints: [{ fuzzy: false, type: 'simple', searchTerm: '*' }] }];

export const getSimpleConstraintGroup = (searchTerm :string) => [
  { constraints: [{ fuzzy: false, type: 'simple', searchTerm }] }
];
