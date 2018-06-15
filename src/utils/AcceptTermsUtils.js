export const TERMS_ACCEPTED_TOKEN = 'openlattice_psa_terms_accepted';

export function termsAreAccepted() {
  return localStorage.getItem(TERMS_ACCEPTED_TOKEN) === 'true';
}

export function acceptTerms() {
  localStorage.setItem(TERMS_ACCEPTED_TOKEN, 'true');
}

export function removeTermsToken() {
  localStorage.removeItem('openlattice_psa_terms_accepted');
}
