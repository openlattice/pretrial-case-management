/*
 * @flow
 */

export const CURRENT_AGE_PROMPT =
  '1. What was the defendant’s age at the time of the arrest or administering the PSA – Court?';
export const CURRENT_VIOLENT_OFFENSE_PROMPT = '2. Is any current charge considered violent?';
export const PENDING_CHARGE_PROMPT =
  '3. Did the defendant have at least one other pending charge at the time of the alleged offense?';
export const PRIOR_MISDEMEANOR_PROMPT = '4. Does the defendant have any prior misdemeanor convictions?';
export const PRIOR_FELONY_PROMPT = '5. Does the defendant have any prior felony convictions?';
export const PRIOR_VIOLENT_CONVICTION_PROMPT = '6. How many prior violent convictions does the defendant have?';
export const PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT =
  '7. How many prior pre-trial failures to appear does the defendant have in the past 2 years?';
export const PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT =
  '8. Does the defendant have any prior pre-trial failures to appear that are older than 2 years?';
export const PRIOR_SENTENCE_TO_INCARCERATION_PROMPT = '9. Does the defendant have any prior sentence to incarceration?';

export const EXTRADITED_PROMPT = '10. Was the defendant extradited for any current charge?';
export const STEP_2_CHARGES_PROMPT = '11. Is any current charge escape 1st or 2nd degree murder (1st & 2nd murder, 1st manslaughter), 1st, 2nd, and 3rd degree rape, kidnapping 1st, robbery 1st, an attempt to commit any of these charges, or a pretrial FTA for any of these charges?';
export const STEP_4_CHARGES_PROMPT = '12. Is any current charge domestic violence, stalking, violation of a protection order, violation of a no contact order, aggravated assault, a person to person sex crime (includes 22-24a-5), 4th degree rape, arson, robbery 2nd, kidnapping 2nd, any offense that results in the death of a human, involved the use of a weapon, an attempt to commit any of these charges, or a pretrial FTA for any of these charges?';
export const COURT_OR_BOOKING_PROMPT = '13. Is the PSA being administered at the time of booking or court date?';
