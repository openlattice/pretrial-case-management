/*
 * @flow
 */
/* eslint max-len: 0 */ // --> OFF

export const CURRENT_AGE_PROMPT = 'What was the person’s age on the date at the time of the arrest?';
export const CURRENT_VIOLENT_OFFENSE_PROMPT = 'Is any current charge considered violent?';
export const PENDING_CHARGE_PROMPT = 'Did the person have at least one other a pending charge at the time of the arrest? ';
export const PRIOR_MISDEMEANOR_PROMPT = 'Does the defendant person have any prior misdemeanor convictions?';
export const PRIOR_FELONY_PROMPT = 'Does the defendant person have any prior felony convictions?';
export const PRIOR_VIOLENT_CONVICTION_PROMPT = 'How many prior violent convictions does the defendant person have?';
export const PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT = 'How many prior pretrial failures to appear does the defendant person have in the past 2 years?';
export const PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT = 'Does the defendant person have any prior pretrial failures to appear that are older than 2 years?';
export const PRIOR_SENTENCE_TO_INCARCERATION_PROMPT = 'Does the defendant person have any prior sentences to incarceration?';
export const EXTRADITED_PROMPT = 'Was the defendant extradited for any current charge?';
export const SECONDARY_RELEASE_CHARGES_PROMPT = 'Does the booking hold exception list apply?';
export const SECONDARY_HOLD_CHARGES_PROMPT = 'Does the booking release exception list apply?';

export const MAX_LEVEL_PROMPT = 'Do any charges match charges with a Max Level Increase Flag?';

export const SINGLE_LEVEL_INCREASE = 'Do any charges match charges with a Single Level Increase Flag?';
