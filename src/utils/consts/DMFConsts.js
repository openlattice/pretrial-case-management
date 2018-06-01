import { PROPERTY_TYPES } from './DataModelConsts';
import { CHARGE } from './Consts';
import { PENN_BOOKING_EXCEPTIONS } from './DMFExceptionsList';

const {
  STATUTE,
  DESCRIPTION
} = CHARGE;

export const CONTEXT = {
  COURT_MINN: 'Court (Minnehaha)',
  COURT_PENN: 'Court (Pennington)',
  BOOKING: 'Booking'
};

export const CHARGE_TYPES = {
  ESCAPE_FIRST_DEGREE: 'ESCAPE_FIRST_DEGREE',
  ESCAPE_SECOND_DEGREE: 'ESCAPE_SECOND_DEGREE',
  MURDER_FIRST_DEGREE: 'MURDER_FIRST_DEGREE',
  MURDER_SECOND_DEGREE: 'MURDER_SECOND_DEGREE',
  ATTEMPTED_MURDER: 'ATTEMPTED_MURDER',
  MANSLAUGHTER_FIRST_DEGREE: 'MANSLAUGHTER_FIRST_DEGREE',
  RAPE_FIRST_DEGREEE: 'RAPE_FIRST_DEGREEE',
  RAPE_SECOND_DEGREE: 'RAPE_SECOND_DEGREE',
  RAPE_THIRD_DEGREE: 'RAPE_THIRD_DEGREE',
  KIDNAPPING_FIRST_DEGREE: 'KIDNAPPING_FIRST_DEGREE',
  ROBBERY_FIRST_DEGREE: 'ROBBERY_FIRST_DEGREE',
  DOMESTIC_VIOLENCE: 'DOMESTIC_VIOLENCE',
  STALKING: 'STALKING',
  VIOLATION_OF_PROTECTION_ORDER: 'VIOLATION_OF_PROTECTION_ORDER',
  VIOLATION_OF_NO_CONTACT_ORDER: 'VIOLATION_OF_NO_CONTACT_ORDER',
  AGGRAVATED_ASSAULT: 'AGGRAVATED_ASSAULT',
  PERSON_TO_PERSON_SEX_CRIME: 'PERSON_TO_PERSON_SEX_CRIME',
  RAPE_FOURTH_DEGREE: 'RAPE_FOURTH_DEGREE',
  ARSON: 'ARSON',
  ROBBERY_SECOND_DEGREE: 'ROBBERY_SECOND_DEGREE',
  KIDNAPPING_SECOND_DEGREE: 'KIDNAPPING_SECOND_DEGREE',
  OFFENSE_RESULTING_IN_HUMAN_DEATH: 'OFFENSE_RESULTING_IN_HUMAN_DEATH',
  OFFENSE_INVOLVING_WEAPON: 'OFFENSE_INVOLVING_WEAPON'
};

export const CHARGE_VALUES = {
  [CHARGE_TYPES.ESCAPE_FIRST_DEGREE]: [{
    [STATUTE]: '22-11A-2',
    [DESCRIPTION]: 'Escape by prisoner - 1st Degree (F4)'
  }],

  [CHARGE_TYPES.ESCAPE_SECOND_DEGREE]: [{
    [STATUTE]: '22-11A-2.1',
    [DESCRIPTION]: 'Escape by prisoner - 2nd Degree (F5)'
  }],

  [CHARGE_TYPES.MURDER_FIRST_DEGREE]: [{
    [STATUTE]: '22-16-4',
    [DESCRIPTION]: 'Murder in First Degree/Felony Murder(FA)'
  }],

  [CHARGE_TYPES.MURDER_SECOND_DEGREE]: [{
    [STATUTE]: '22-16-7',
    [DESCRIPTION]: 'Murder In Second Degree-Depraved Mind(FB)'
  }],

  [CHARGE_TYPES.ATTEMPTED_MURDER]: [{
    [STATUTE]: '22-16-4',
    [DESCRIPTION]: 'Attempted Murder (F2)'
  }],

  [CHARGE_TYPES.MANSLAUGHTER_FIRST_DEGREE]: [{
    [STATUTE]: '22-16-15',
    [DESCRIPTION]: 'Manslaughter in First Degree-Heat of Passion(FC)'
  }],

  [CHARGE_TYPES.RAPE_FIRST_DEGREEE]: [{
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - 1st Degree - Less than 13 years of age(FC)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Female/Female - V < 13 (1st Degree, Class C Felony)(FC)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Male/Male - Sodomy if Victim Less than 13 Years of Age(FC)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape if Victim Less Than 13 Years of Age or Intoxication Level Incapable of Consent(FC)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape with Object if Victim Less than 13 Years of Age (FC)'
  }],

  [CHARGE_TYPES.RAPE_SECOND_DEGREE]: [{
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - 2nd Degree - Force, Coercion, Threats(F1)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Female/Female - 2nd Deg, Class 1 Felony(F1)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Male/Male - Sodomy by Force, Coercion, or Threats (F1)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape with Object Using Force, Coercion, or Threats(F1)'
  }],
  [CHARGE_TYPES.RAPE_THIRD_DEGREE]: [{
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - 3rd Degree - Physical or Mental Incapacity(F2)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - 3rd Degree - V incapable of giving consent because of any Intoxicating, Narcotic, or Anesthetic Agent or Hypnosis(F2)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Female/Female - V Incapable Intox/Drug (3rd deg. Class 2 Felony)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Female/Female - V Incapable Phys or Ment (3rd Deg, Class 2 Felony)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Male/Male - Sodomy if V is Incapable because of Physical or Mental Incapacity(F2)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Male/Male - Sodomy if V is Incapable of Giving Consent because of any Intoxicating, Narcotic, or Anesthetic Agent or Hypnosis(F2)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape by Force, Coercion, or Threats or Physically Incapable of Giving Consent(F2)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape with Object if V is Incapabale because of Intoxicating, Narcotic, Anesthetic Agent or Hypnosis(F2)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape with Object if V is Incapable because of Physical or Mental Incapacity of Giving Consent(F2)'
  }],

  [CHARGE_TYPES.KIDNAPPING_FIRST_DEGREE]: [{
    [STATUTE]: '22-19-1',
    [DESCRIPTION]: 'Kidnapping 1st Degree(FC)'
  }, {
    [STATUTE]: '22-19-1',
    [DESCRIPTION]: 'Aggravated Kidnapping With Serious Injury(FB)'
  }],

  [CHARGE_TYPES.ROBBERY_FIRST_DEGREE]: [{
    [STATUTE]: '22-30-6',
    [DESCRIPTION]: 'Robbery In The First Degree(F2)'
  }],

  [CHARGE_TYPES.DOMESTIC_VIOLENCE]: [{
    [STATUTE]: '22-18-1.1',
    [DESCRIPTION]: 'Aggravated Assault Domestic(F3)'
  }, {
    [STATUTE]: '22-18-1',
    [DESCRIPTION]: 'Simple Assault Domestic (F6)'
  }, {
    [STATUTE]: '22-18-1',
    [DESCRIPTION]: 'Simple Assault Domestic (M1)'
  }],

  [CHARGE_TYPES.STALKING]: [{
    [STATUTE]: '22-19A-1',
    [DESCRIPTION]: 'Stalking - 2nd or Subsequent Conviction (F6)'
  }, {
    [STATUTE]: '22-19A-7',
    [DESCRIPTION]: 'Stalking - Child 12 or Younger(F6)'
  }, {
    [STATUTE]: '22-19A-1',
    [DESCRIPTION]: 'Stalking (1)(M1)'
  }, {
    [STATUTE]: '22-19A-1',
    [DESCRIPTION]: 'Stalking (2)(M1)'
  }, {
    [STATUTE]: '22-19A-1',
    [DESCRIPTION]: 'Stalking (3)(M1)'
  }, {
    [STATUTE]: '22-19A-1',
    [DESCRIPTION]: 'Stalking Domestic - 1st offense (M1)'
  }, {
    [STATUTE]: '22-19A-1',
    [DESCRIPTION]: 'Stalking(M1)'
  }],

  [CHARGE_TYPES.VIOLATION_OF_PROTECTION_ORDER]: [],

  [CHARGE_TYPES.VIOLATION_OF_NO_CONTACT_ORDER]: [],

  [CHARGE_TYPES.AGGRAVATED_ASSAULT]: [{
    [STATUTE]: '22-18-1.05',
    [DESCRIPTION]: 'Aggravated Assault - Against Law Enforcement Officer/Corrections/Parole/Probation (F2)'
  }, {
    [STATUTE]: '22-18-1.1',
    [DESCRIPTION]: 'Aggravated Assault (F3)'
  }, {
    [STATUTE]: '22-18-1.1',
    [DESCRIPTION]: 'Aggravated Assault Domestic Child Under 3 Years of Age(F3)'
  }, {
    [STATUTE]: '22-18-1.1',
    [DESCRIPTION]: 'Aggravated Assault Domestic Intimidation(F3)'
  }, {
    [STATUTE]: '22-18-1.1',
    [DESCRIPTION]: 'Aggravated Assault Intimidation(F3)'
  }, {
    [STATUTE]: '22-18-1.1',
    [DESCRIPTION]: 'Aggravated Assault-Child Under 3 Yrs of Age(F3)'
  }],

  [CHARGE_TYPES.PERSON_TO_PERSON_SEX_CRIME]: [{
    [STATUTE]: '22-22-7',
    [DESCRIPTION]: 'Sexual Contact with Child at Least 13 Years of Age and Actor Less Than 5 years Older(M1)'
  }, {
    [STATUTE]: '22-22-7',
    [DESCRIPTION]: 'Sexual Contact With Child Less Than 16 - Offender 16 Years of Age or Older(F3)'
  }, {
    [STATUTE]: '22-22-7.2',
    [DESCRIPTION]: 'Sexual Contact-Victim Incapable of Consent and Over 16(F4)'
  }, {
    [STATUTE]: '22-22-7.3',
    [DESCRIPTION]: 'Sexual Contact Both Under 16 Years of Age(M1)'
  }, {
    [STATUTE]: '22-22-7.4',
    [DESCRIPTION]: 'Sexual Contact without Consent 15 Years of Age or Older(M1)'
  }, {
    [STATUTE]: '22-22-7.6',
    [DESCRIPTION]: 'Sexual Contact between Jail Employees and Adult Detainees (F6)'
  }, {
    [STATUTE]: '22-22-7.6',
    [DESCRIPTION]: 'Sexual Contact between Jail Employees and Juvenile Detainees(F4)'
  }, {
    [STATUTE]: '22-24A-5',
    [DESCRIPTION]: 'Solicitation of a Minor (F4)'
  }],

  [CHARGE_TYPES.RAPE_FOURTH_DEGREE]: [{
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Female/Female - V = 13, but < 16, and S at least 3 yrs older than V (4th Deg, Class 3 Felony)(F3)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape - Male/Male - Sodomy of Victim Age 13 but Less than 16 Years Old and S at Least 3 Years Older Than V(F3)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape of Victim Age 13 but Less than 16 years old and the S is at Least 3 Years Older than the V(F3)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Rape with Object of Victim Age 13 but Less than 16 Years Old and S at Least 3 Years Older than V(F3)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Statutory rape - Victim Age 13 but Less than 16 years old and S at Least 3 years older (F3)'
  }, {
    [STATUTE]: '22-22-1',
    [DESCRIPTION]: 'Statutory Rape - Victim Age 13 but Less than 16 years old and S at Least 3 years older (F3)'
  }],

  [CHARGE_TYPES.ARSON]: [{
    [STATUTE]: '22-33-9.1',
    [DESCRIPTION]: 'Arson 1st Degree(F2)'
  }, {
    [STATUTE]: '22-33-9.2',
    [DESCRIPTION]: 'Arson 2nd Degree (1)(F4)'
  }, {
    [STATUTE]: '22-33-9.2',
    [DESCRIPTION]: 'Arson 2nd Degree (2-Insurance)(F4)'
  }, {
    [STATUTE]: '22-33-9.2',
    [DESCRIPTION]: 'Arson 2nd Degree(F4)'
  }, {
    [STATUTE]: '22-33-3',
    [DESCRIPTION]: 'Arson-3rd Degree (REPEALED)'
  }],

  [CHARGE_TYPES.ROBBERY_SECOND_DEGREE]: [{
    [STATUTE]: '22-30-6',
    [DESCRIPTION]: 'Robbery in the 2nd Degree(F4)'
  }],

  [CHARGE_TYPES.KIDNAPPING_SECOND_DEGREE]: [{
    [STATUTE]: '22-19-1.1',
    [DESCRIPTION]: 'Aggravated Kidnapping-2nd Degree - Bodily Injury(F1)'
  }],

  [CHARGE_TYPES.OFFENSE_RESULTING_IN_HUMAN_DEATH]: [{
    [STATUTE]: '22-16-1.1',
    [DESCRIPTION]: 'Fetal Homicide(FB)'
  }, {
    [STATUTE]: '22-16-7',
    [DESCRIPTION]: 'Murder In Second Degree-Depraved Mind(FB)'
  }, {
    [STATUTE]: '22-16-20',
    [DESCRIPTION]: 'Manslaughter in Second-Recklessly Killing (F4)'
  }, {
    [STATUTE]: '22-16-41',
    [DESCRIPTION]: 'Vehicular Homicide (F3)'
  }],

  [CHARGE_TYPES.OFFENSE_INVOLVING_WEAPON]: [{
    [STATUTE]: '22-14-6',
    [DESCRIPTION]: 'Possession of Controlled Weapon(F6)'
  }, {
    [STATUTE]: '22-14-8',
    [DESCRIPTION]: 'Concealed Dangerous Weapon with Intent to do Felony(F5)'
  }, {
    [STATUTE]: '22-14-12',
    [DESCRIPTION]: 'Commit or Attempt to Commit Felony with Firearm(F2)'
  }, {
    [STATUTE]: '22-14-20',
    [DESCRIPTION]: 'Discharge of Firearm at Structure/Motor Vehicle (F3)'
  }, {
    [STATUTE]: '22-14-21',
    [DESCRIPTION]: 'Discharge of Firearm From Moving Vehicle(F6)'
  }]
};



export const getCombinedChargeList = (chargeList) => {
  let result = [];
  chargeList.forEach((chargeType) => {
    result = [...result, ...CHARGE_VALUES[chargeType]];
  });
  return result;
};

const dmfStepTwoCharges = getCombinedChargeList([
  CHARGE_TYPES.ESCAPE_FIRST_DEGREE,
  CHARGE_TYPES.ESCAPE_SECOND_DEGREE,
  CHARGE_TYPES.MURDER_FIRST_DEGREE,
  CHARGE_TYPES.MURDER_SECOND_DEGREE,
  CHARGE_TYPES.ATTEMPTED_MURDER,
  CHARGE_TYPES.MANSLAUGHTER_FIRST_DEGREE,
  CHARGE_TYPES.RAPE_FIRST_DEGREEE,
  CHARGE_TYPES.RAPE_SECOND_DEGREE,
  CHARGE_TYPES.RAPE_THIRD_DEGREE,
  CHARGE_TYPES.KIDNAPPING_FIRST_DEGREE,
  CHARGE_TYPES.ROBBERY_FIRST_DEGREE
]);

const dmfStepFourCharges = getCombinedChargeList([
  CHARGE_TYPES.DOMESTIC_VIOLENCE,
  CHARGE_TYPES.STALKING,
  CHARGE_TYPES.VIOLATION_OF_PROTECTION_ORDER,
  CHARGE_TYPES.VIOLATION_OF_NO_CONTACT_ORDER,
  CHARGE_TYPES.AGGRAVATED_ASSAULT,
  CHARGE_TYPES.PERSON_TO_PERSON_SEX_CRIME,
  CHARGE_TYPES.RAPE_FOURTH_DEGREE,
  CHARGE_TYPES.ARSON,
  CHARGE_TYPES.ROBBERY_SECOND_DEGREE,
  CHARGE_TYPES.KIDNAPPING_SECOND_DEGREE,
  CHARGE_TYPES.OFFENSE_RESULTING_IN_HUMAN_DEATH,
  CHARGE_TYPES.OFFENSE_INVOLVING_WEAPON
]);

export const chargeIsInList = (chargesToMatch, statuteNum, description) => {
  let result = false;
  chargesToMatch.forEach((charge) => {
    if (charge[STATUTE] === statuteNum && charge[DESCRIPTION] === description) {
      result = true;
    }
  });
  return result;
};

const filterChargeList = (charges, chargesToMatch) => {
  return charges.filter((charge) => {
    const statuteNum = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '')
    return chargeIsInList(chargesToMatch, statuteNum, description);
  }).map((charge) => {
    return charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
  });
}

export const getAllStepTwoCharges = (chargeList) => {
  return filterChargeList(chargeList, dmfStepTwoCharges);
};

export const getAllStepFourCharges = (chargeList) => {
  return filterChargeList(chargeList, dmfStepFourCharges);
};

export const getAllSecondaryReleaseCharges = (chargeList) => {
  return filterChargeList(chargeList, PENN_BOOKING_EXCEPTIONS);
};
