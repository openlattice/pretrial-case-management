/* eslint max-len: 0 */ // --> OFF
import { CHARGE } from './Consts';

const {
  STATUTE,
  DESCRIPTION
} = CHARGE;

export const CHARGE_TYPES = {
  STEP_TWO: 'STEP_TWO',
  STEP_FOUR: 'STEP_FOUR',
  ALL_VIOLENT: 'ALL_VIOLENT'
};

export const BHE_LABELS = {
  RELEASE: 'BHE Charges',
  HOLD: 'Non-BHE charges exist'
};

export const BRE_LABELS = {
  LABEL: 'BRE Charges'
};

export const CHARGE_VALUES = {
  [CHARGE_TYPES.STEP_TWO]: [
    {
      [STATUTE]: '22-19-1',
      [DESCRIPTION]: 'Aggravated Kidnapping With Serious Injury(FB)'
    },
    {
      [STATUTE]: '22-16-4',
      [DESCRIPTION]: 'Attempted Murder (F2)'
    },
    {
      [STATUTE]: '22-11A-2',
      [DESCRIPTION]: 'Escape by prisoner - 1st Degree (F4)'
    },
    {
      [STATUTE]: '22-11A-2.1',
      [DESCRIPTION]: 'Escape by prisoner - 2nd Degree (F5)'
    },
    {
      [STATUTE]: '22-16-1.1',
      [DESCRIPTION]: 'Fetal Homicide(FB)'
    },
    {
      [STATUTE]: '22-19-1',
      [DESCRIPTION]: 'Kidnapping 1st Degree(FC)'
    },
    {
      [STATUTE]: '22-16-15',
      [DESCRIPTION]: 'Manslaughter in First Degree-Heat of Passion(FC)'
    },
    {
      [STATUTE]: '22-16-4',
      [DESCRIPTION]: 'Murder in First Degree/Felony Murder(FA)'
    },
    {
      [STATUTE]: '22-16-7',
      [DESCRIPTION]: 'Murder In Second Degree-Depraved Mind(FB)'
    },
    {
      [STATUTE]: '22-16-5',
      [DESCRIPTION]: 'Premeditated Design to Effect the Death Defined'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 1st Degree - Less than 13 years of age(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 2nd Degree - Force, Coercion, Threats(F1)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 3rd Deg (DO NOT USE)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 3rd Degree - Physical or Mental Incapacity(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 3rd Degree - V incapable of giving consent because of any Intoxicating, Narcotic, or Anesthetic Agent or Hypnosis(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - 2nd Deg, Class 1 Felony(F1)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V < 13 (1st Degree, Class C Felony)(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V Incapable Intox/Drug (3rd deg. Class 2 Felony)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V Incapable Phys or Ment (3rd Deg, Class 2 Felony)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy by Force, Coercion, or Threats (F1)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy if V is Incapable because of Physical or Mental Incapacity(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: ('Rape - Male/Male - Sodomy if V is Incapable of Giving Consent because of any Intoxicating, Narcotic, or Anesthetic Agent or Hypnosis(F2)')
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy if Victim Less than 13 Years of Age(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape by Force, Coercion, or Threats or Physically Incapable of Giving Consent(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape if Victim Less Than 13 Years of Age or Intoxication Level Incapable of Consent(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object if V is Incapabale because of Intoxicating, Narcotic, Anesthetic Agent or Hypnosis(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object if V is Incapable because of Physical or Mental Incapacity of Giving Consent(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object if Victim Less than 13 Years of Age (FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object Using Force, Coercion, or Threats(F1)'
    },
    {
      [STATUTE]: '22-30-6',
      [DESCRIPTION]: 'Robbery In The First Degree(F2)'
    },

    /* MINNEHAHA ONLY */

    {
      [STATUTE]: '22-11A-2',
      [DESCRIPTION]: 'Escape in 1st Degree'
    },
    {
      [STATUTE]: '22-16-4.2',
      [DESCRIPTION]: 'Murder in First Degree with Other Crimes'
    },
    {
      [STATUTE]: '22-16-9',
      [DESCRIPTION]: 'Murder in the Second Degree-Without Design Commission of Felony'
    },
    {
      [STATUTE]: '22-19-1(BFel)',
      [DESCRIPTION]: 'Aggravated Kidnapping in First Degree With Serious Injury as a Class B Felony'
    },
    {
      [STATUTE]: '22-19-1(CFel)',
      [DESCRIPTION]: 'Kidnapping in the First Degree as a Class C Felony'
    },
    {
      [STATUTE]: '22-22-1.2(F1)',
      [DESCRIPTION]: 'Rape Through Use of Force, Coercion, or Threats of Bodily Harm'
    },
    {
      [STATUTE]: '22-22-1(F1)',
      [DESCRIPTION]: 'Rape 2nd Degree - Class 1 Felony'
    },
    {
      [STATUTE]: '22-22-1(F1)',
      [DESCRIPTION]: 'Rape with Object in the 2nd Degree - Class 1 Felony'
    },
    {
      [STATUTE]: '22-22-1(F1)',
      [DESCRIPTION]: 'Sodomy Rape in 2nd Degree - Class 1 Felony'
    },
    {
      [STATUTE]: '22-22-1(F2)',
      [DESCRIPTION]: 'Rape in 3rd Degree - Class 2 Felony'
    },
    {
      [STATUTE]: '22-22-1(F2)',
      [DESCRIPTION]: 'Rape With Object in 3rd Degree - Class 2 Felony'
    },
    {
      [STATUTE]: '22-22-1(F2)',
      [DESCRIPTION]: 'Sodomy Rape in 3rd Degree - Class 2 Felony'
    },
    {
      [STATUTE]: '22-22-1(FC)',
      [DESCRIPTION]: 'Rape in 1st Degree if Victim less than 13 - Class C Felony'
    },
    {
      [STATUTE]: '22-22-1(FC)',
      [DESCRIPTION]: 'Rape with Object in First Degree if victim less than 13 - Class C Felony'
    },
    {
      [STATUTE]: '22-22-1(FC)',
      [DESCRIPTION]: 'Sodomy Rape in 1st Degree if victim less than 13 - Class C Felony'
    },
    {
      [STATUTE]: '22-30-6(F2)',
      [DESCRIPTION]: 'Robbery In The First Degree'
    }
  ],

  [CHARGE_TYPES.STEP_FOUR]: [
    {
      [STATUTE]: '22-10-5',
      [DESCRIPTION]: 'Aggravated Riot (Carrying Dangerous Weapon) (F3)'
    },
    {
      [STATUTE]: '25-10-13(M1)',
      [DESCRIPTION]: 'Violation of Protection or No Contact Order'
    },
    {
      [STATUTE]: '22-14-12',
      [DESCRIPTION]: 'Commit or Attempt to Commit Felony with Firearm(F2)'
    },
    {
      [STATUTE]: '22-14-12',
      [DESCRIPTION]: 'Commission of felony while armed with firearms--Felony'
    },
    {
      [STATUTE]: '22-14-20',
      [DESCRIPTION]: 'Discharge of Firearm at Structure/Motor Vehicle (F3)'
    },
    {
      [STATUTE]: '22-14-21',
      [DESCRIPTION]: 'Discharge of firearm from moving motor vehicle in municipality - felony'
    },
    {
      [STATUTE]: '22-14-8',
      [DESCRIPTION]: 'Concealed Dangerous Weapon with Intent to do Felony(F5)'
    },
    {
      [STATUTE]: '22-14-8',
      [DESCRIPTION]: 'Concealment of a weapon with intent to commit felony'
    },
    {
      [STATUTE]: '22-16-20',
      [DESCRIPTION]: 'Manslaughter in Second-Recklessly Killing (F4)'
    },
    {
      [STATUTE]: '22-16-34',
      [DESCRIPTION]: 'Justifiable Homicide- Resisting Attempted Murder or Felony in Dwelling'
    },
    {
      [STATUTE]: '22-16-35',
      [DESCRIPTION]: 'Justifiable Homicide- Defense of Persons in Household'
    },
    {
      [STATUTE]: '22-16-37',
      [DESCRIPTION]: 'Aiding and Abetting Suicide (F6)'
    },
    {
      [STATUTE]: '22-16-41',
      [DESCRIPTION]: 'Vehicular Homicide (F3)'
    },
    {
      [STATUTE]: '22-17-6',
      [DESCRIPTION]: 'Intentional Killing of Human Fetus by Unauthorized Injury to Mother'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault Domestic (F6)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault Domestic (M1)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault Domestic Intimidation (M1)'
    },
    {
      [STATUTE]: '22-18-1.05',
      [DESCRIPTION]: 'Aggravated Assault - Against Law Enforcement Officer/Corrections/Parole/Probation (F2)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault (F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Domestic Child Under 3 Years of Age(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Domestic Intimidation(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Domestic(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Intimidation(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault-Child Under 3 Yrs of Age(F3)'
    },
    {
      [STATUTE]: '22-18-1.3',
      [DESCRIPTION]: 'Aggravated Criminal Battery of an Unborn Child'
    },
    {
      [STATUTE]: '22-18-1.4',
      [DESCRIPTION]: 'Aggravated battery of an infant(F2)'
    },
    {
      [STATUTE]: '22-18-1.5',
      [DESCRIPTION]: 'Assault with intent to cause serious permanent disfigurement'
    },
    {
      [STATUTE]: '22-19-1.1',
      [DESCRIPTION]: 'Aggravated Kidnapping-2nd Degree - Bodily Injury(F1)'
    },
    {
      [STATUTE]: '22-19-1.1',
      [DESCRIPTION]: 'Kidnapping - 2nd Degree(F3)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking - 2nd or Subsequent Conviction (F6)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking (1)(M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking (2)(M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking (3)(M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking Domestic - 1st offense (M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking(M1)'
    },
    {
      [STATUTE]: '22-19A-16',
      [DESCRIPTION]: 'Violation of a Stalking Protection Order (M1)'
    },
    {
      [STATUTE]: '22-19A-16',
      [DESCRIPTION]: 'Violation of Stalking Protection Order (F6)'
    },
    {
      [STATUTE]: '22-19A-16',
      [DESCRIPTION]: 'Violation of Stalking Protection Order Domestic(F6)'
    },
    {
      [STATUTE]: '22-19A-16',
      [DESCRIPTION]: 'Violation of Stalking Protection Order Including Aggravated Assault(F6)'
    },
    {
      [STATUTE]: '22-19A-16',
      [DESCRIPTION]: 'Violation of Stalking Protection Order Prior Including Aggravated Assault Domestic(F6)'
    },
    {
      [STATUTE]: '22-19A-17',
      [DESCRIPTION]: 'Violation of No Contact Prior to Court Appearance Domestic(M1)'
    },
    {
      [STATUTE]: '22-19A-17',
      [DESCRIPTION]: 'Violation of No Contact Prior to Court Appearance(M1)'
    },
    {
      [STATUTE]: '22-19A-18',
      [DESCRIPTION]: 'Violation of No Contact Terms (M1)'
    },
    {
      [STATUTE]: '22-19A-7',
      [DESCRIPTION]: 'Stalking - Child 12 or Younger(F6)'
    },
    {
      [STATUTE]: '22-19A-16(F6)',
      [DESCRIPTION]: 'Violation of Stalking Protection Order Including Aggravated Assault'
    },
    {
      [STATUTE]: '22-19A-16(F6)',
      [DESCRIPTION]: 'Violation of Stalking Protection Order Prior Including Aggravated Assault Domestic'
    },
    {
      [STATUTE]: '22-19A-16(M1)',
      [DESCRIPTION]: 'Violation of a Stalking Protection Order'
    },
    {
      [STATUTE]: '22-19A-16(M1)',
      [DESCRIPTION]: 'Violation of Stalking Protection Order Domestic'
    },
    {
      [STATUTE]: '22-19A-17',
      [DESCRIPTION]: 'Violation of No Contact Prior to Court Appearance'
    },
    {
      [STATUTE]: '22-19A-17',
      [DESCRIPTION]: 'Violation of No Contact Prior to Court Appearance Domestic'
    },
    {
      [STATUTE]: '22-19A-18',
      [DESCRIPTION]: 'Bond-No contact terms'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V = 13, but < 16, and S at least 3 yrs older than V (4th Deg, Class 3 Felony)(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy of Victim Age 13 but Less than 16 Years Old and S at Least 3 Years Older Than V(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape of Victim Age 13 but Less than 16 years old and the S is at Least 3 Years Older than the V(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object of Victim Age 13 but Less than 16 Years Old and S at Least 3 Years Older than V(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Statutory rape - Victim Age 13 but Less than 16 years old and S at Least 3 years older (F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Statutory Rape - Victim Age 13 but Less than 16 years old and S at Least 3 years older (F3)'
    },
    {
      [STATUTE]: '22-22-23, 22-22-23.1',
      [DESCRIPTION]: 'Sex Offense-Photograph Child in Obscene Act (REPEALED - DO NOT USE)'
    },
    {
      [STATUTE]: '22-22-23, 22-22-23.1',
      [DESCRIPTION]: 'Sex Offense-Possession of Child Pornography (DO NOT USE-REPEALED)'
    },
    {
      [STATUTE]: '22-22-24.3',
      [DESCRIPTION]: 'Sexual Exploitation of Minor (F6)'
    },
    {
      [STATUTE]: '22-22-7',
      [DESCRIPTION]: 'Sexual Contact with Child at Least 13 Years of Age and Actor Less Than 5 years Older(M1)'
    },
    {
      [STATUTE]: '22-22-7',
      [DESCRIPTION]: 'Sexual Contact With Child Less Than 16 - Offender 16 Years of Age or Older(F3)'
    },
    {
      [STATUTE]: '22-22-7.2',
      [DESCRIPTION]: 'Sexual Contact-Victim Incapable of Consent and Over 16(F4)'
    },
    {
      [STATUTE]: '22-22-7.3',
      [DESCRIPTION]: 'Sexual Contact Both Under 16 Years of Age(M1)'
    },
    {
      [STATUTE]: '22-22-7.4',
      [DESCRIPTION]: 'Sexual Contact without Consent 15 Years of Age or Older(M1)'
    },
    {
      [STATUTE]: '22-22-7.6',
      [DESCRIPTION]: 'Sexual Contact between Jail Employees and Adult Detainees (F6)'
    },
    {
      [STATUTE]: '22-22-7.6',
      [DESCRIPTION]: 'Sexual Contact between Jail Employees and Juvenile Detainees(F4)'
    },
    {
      [STATUTE]: '22-24A-5',
      [DESCRIPTION]: 'Solicitation of a Minor (F4)'
    },
    {
      [STATUTE]: '22-30-6',
      [DESCRIPTION]: 'Robbery in the 2nd Degree(F4)'
    },
    {
      [STATUTE]: '22-33-3',
      [DESCRIPTION]: 'Arson-3rd Degree (REPEALED)'
    },
    {
      [STATUTE]: '22-33-9.1',
      [DESCRIPTION]: 'Arson 1st Degree(F2)'
    },
    {
      [STATUTE]: '22-33-9.2',
      [DESCRIPTION]: 'Arson 2nd Degree (1)(F4)'
    },
    {
      [STATUTE]: '22-33-9.2',
      [DESCRIPTION]: 'Arson 2nd Degree (2-Insurance)(F4)'
    },
    {
      [STATUTE]: '22-33-9.2',
      [DESCRIPTION]: 'Arson 2nd Degree(F4)'
    },
    {
      [STATUTE]: '25-10-13',
      [DESCRIPTION]: 'Violation of No Contact Order (F6)'
    },
    {
      [STATUTE]: '25-10-13',
      [DESCRIPTION]: 'Violation of No Contact Order (M1)'
    },
    {
      [STATUTE]: '25-10-13',
      [DESCRIPTION]: 'Violation of No Contact Order as Condition of Sentence (M1)'
    },
    {
      [STATUTE]: '25-10-13',
      [DESCRIPTION]: 'Violation of Protection Order (F6)'
    },
    {
      [STATUTE]: '25-10-13',
      [DESCRIPTION]: 'Violation of Protection Order (M1)'
    },
    {
      [STATUTE]: '25-10-23',
      [DESCRIPTION]: 'Violation of Conditional Bond from Jail (letter)(M1)'
    },
    {
      [STATUTE]: '25-10-23',
      [DESCRIPTION]: 'Violation of Conditional Bond from Jail(M1)'
    },
    {
      [STATUTE]: '25-10-23',
      [DESCRIPTION]: 'Violation of Conditional Bond(M1)'
    },
    {
      [STATUTE]: '25-10-23',
      [DESCRIPTION]: 'Violation of No Contact Order (F6)'
    },
    {
      [STATUTE]: '25-10-23',
      [DESCRIPTION]: 'Violation of No Contact Order (M2)'
    },
    {
      [STATUTE]: '25-10-43',
      [DESCRIPTION]: 'Violation of No Contact with DV Victim (M1)'
    },

    /* MINNEHAHA ONLY */

    {
      [STATUTE]: '22-14-12',
      [DESCRIPTION]: 'Commit or Attempt to Commit Felony with Firearm'
    },
    {
      [STATUTE]: '22-14-13.1',
      [DESCRIPTION]: 'Commission of Felony Armed with Stun Gun'
    },
    {
      [STATUTE]: '22-14-20(F4)',
      [DESCRIPTION]: 'Discharge of Firearm-At Occupied Structure or Car= F4 - Injury'
    },
    {
      [STATUTE]: '22-14-20(F5)',
      [DESCRIPTION]: 'Discharge of Firearm- At Occupied Structure or Car=F5 No Injury'
    },
    {
      [STATUTE]: '22-14-21',
      [DESCRIPTION]: 'Discharge of Firearm From Moving Vehicle'
    },
    {
      [STATUTE]: '22-14-8',
      [DESCRIPTION]: 'Concealed Dangerous Weapon with Intent to do Felony'
    },
    {
      [STATUTE]: '22-18-1.05(F2)',
      [DESCRIPTION]: 'Aggravated Assault on Law Enforcement Officer or Other Public Officer'
    },
    {
      [STATUTE]: '22-18-1.1(F2)',
      [DESCRIPTION]: 'Aggravated Assault-Child Under 3 Yrs of Age'
    },
    {
      [STATUTE]: '22-18-1.1(F2)',
      [DESCRIPTION]: 'Aggravated Assault Domestic Child Under 3 Years of Age'
    },
    {
      [STATUTE]: '22-18-1.3',
      [DESCRIPTION]: 'Serious Injury to Unborn Child as Aggravated Assault'
    },
    {
      [STATUTE]: '22-18-1.4',
      [DESCRIPTION]: 'Serious Injury to an Infant as Aggravated Assault'
    },
    {
      [STATUTE]: '22-18-1.5',
      [DESCRIPTION]: 'Aggravated Assault with Intent to Disfigure - Felony'
    },
    {
      [STATUTE]: '22-19-1.1(F1)',
      [DESCRIPTION]: 'Aggravated Kidnapping in the Second Degree with Serious Injury as a Class 1 Felony'
    },
    {
      [STATUTE]: '22-19-1.1(F3)',
      [DESCRIPTION]: 'Kidnapping in the Second Degree as a Class 3 Felony'
    },
    {
      [STATUTE]: '22-19A-2',
      [DESCRIPTION]: 'Stalking - With Protection Order or No contact or Restraining in Effect'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Rape in 4th Degree - Class 3 Felony'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Rape in 4th Degree - Class 3 Felony (Statutory Rape)'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Rape with Object in 4th Degree - Class 3 Felony'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Sodomy Rape in 4th Degree - Class 3 Felony'
    },
    {
      [STATUTE]: '22-22-23',
      [DESCRIPTION]: 'Photography of Child in Obscene Act'
    },
    {
      [STATUTE]: '22-22-7.4',
      [DESCRIPTION]: 'Sexual Contact without Consent'
    },
    {
      [STATUTE]: '22-22-7.6',
      [DESCRIPTION]: 'Sexual Acts Between Jail Employees and Detainees'
    },
    {
      [STATUTE]: '22-22-7.6(F4)',
      [DESCRIPTION]: 'Sexual Act Between Jail Employees and Detainees Juvenile'
    },
    {
      [STATUTE]: '22-22-7(F3)',
      [DESCRIPTION]: 'Sexual Contact With Child Less Than 16 - Offender 5+ Years Older'
    },
    {
      [STATUTE]: '22-22-7(M1)',
      [DESCRIPTION]: 'Sexual Contact with Child Under 16 - Offender Less Than 5 years Older'
    },
    {
      [STATUTE]: '22-30-6(F4)',
      [DESCRIPTION]: 'Robbery in the 2nd Degree'
    },
    {
      [STATUTE]: '22-32-1',
      [DESCRIPTION]: 'Burglary in First Degree Inflict Injury on Another, Possess Weapon, or Nighttime(F2)'
    },
    {
      [STATUTE]: '22-33-1',
      [DESCRIPTION]: 'Arson 1st Degree Known to be Occupied Structure'
    },
    {
      [STATUTE]: '22-33-3',
      [DESCRIPTION]: 'Arson 3rd Degree Burning Unoccupied Structure'
    },
    {
      [STATUTE]: '22-33-9.2',
      [DESCRIPTION]: 'Arson 2nd Degree-Set fire to unoccupied structure or to collect insurance'
    },
    {
      [STATUTE]: '25-10-13(F6)',
      [DESCRIPTION]: 'Violation Of Protection or No Contact Order -Felony if Assault or Stalking Included'
    },
    {
      [STATUTE]: '25-10-23',
      [DESCRIPTION]: 'Violation of Conditional Bond No Contact in Domestic Arrest'
    },
    {
      [STATUTE]: '25-10-25',
      [DESCRIPTION]: 'Violation of Conditional Contact per Crime of Domestic'
    },
    {
      [STATUTE]: '25-10-43',
      [DESCRIPTION]: 'Defendant prohibit contact victim prior court appearance'
    }
  ],

  [CHARGE_TYPES.ALL_VIOLENT]: [
    {
      [STATUTE]: '26-10-1',
      [DESCRIPTION]: 'Abuse or Cruelty to a Minor Age 7+ (F4) (Major Injuries)'
    },
    {
      [STATUTE]: '26-10-1',
      [DESCRIPTION]: 'Abuse or Cruelty to a Minor Age 7+ (F4) (Minor Injuries)'
    },
    {
      [STATUTE]: '26-10-1',
      [DESCRIPTION]: 'Abuse or Cruelty to a Minor Under Age 7 (F3) (Major Injuries)'
    },
    {
      [STATUTE]: '26-10-1',
      [DESCRIPTION]: 'Abuse or Cruelty to a Minor Under Age 7 (F3) (Minor Injuries)'
    },
    {
      [STATUTE]: '22-14-20',
      [DESCRIPTION]: 'Discharge of Firearm at Structure/Motor Vehicle (F3)'
    },
    {
      [STATUTE]: '22-46-2',
      [DESCRIPTION]: 'Abuse or Neglect of Disabled Adult (F6)'
    },
    {
      [STATUTE]: '22-8-12',
      [DESCRIPTION]: 'Act of Terrorism - Felony'
    },
    {
      [STATUTE]: '22-18-1.05',
      [DESCRIPTION]: 'Aggravated Assault - Against Law Enforcement Officer/Corrections/Parole/Probation (F2)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault (F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Domestic Child Under 3 Years of Age(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Domestic Intimidation(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Domestic(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault Intimidation(F3)'
    },
    {
      [STATUTE]: '22-18-1.1',
      [DESCRIPTION]: 'Aggravated Assault-Child Under 3 Yrs of Age(F3)'
    },
    {
      [STATUTE]: '22-18-1.4',
      [DESCRIPTION]: 'Aggravated battery of an infant(F2)'
    },
    {
      [STATUTE]: '22-18-1.3',
      [DESCRIPTION]: 'Aggravated Criminal Battery of an Unborn Child'
    },
    {
      [STATUTE]: '22-19-1',
      [DESCRIPTION]: 'Aggravated Kidnapping With Serious Injury(FB)'
    },
    {
      [STATUTE]: '22-19-1.1',
      [DESCRIPTION]: 'Aggravated Kidnapping-2nd Degree - Bodily Injury(F1)'
    },
    {
      [STATUTE]: '22-10-5',
      [DESCRIPTION]: 'Aggravated Riot (Carrying Dangerous Weapon) (F3)'
    },
    {
      [STATUTE]: '22-33-9.1',
      [DESCRIPTION]: 'Arson 1st Degree(F2)'
    },
    {
      [STATUTE]: '22-18-29',
      [DESCRIPTION]: 'Assault By Adult confined in Jail w/Body Fluids(F6)'
    },
    {
      [STATUTE]: '22-18-26',
      [DESCRIPTION]: 'Assault By Convicted Dept of Corrections Inmate-Int. Cause Contact w/Bodily Fluids (F6)'
    },
    {
      [STATUTE]: '22-18-29.1',
      [DESCRIPTION]: 'Assault By Juvenile confined in Detention facility w/Body Fluids(F6)'
    },
    {
      [STATUTE]: '22-18-26.1',
      [DESCRIPTION]: 'Assault by Other to Cause Contact with Bodily Fluids or Human Waste(M1)'
    },
    {
      [STATUTE]: '22-4-2',
      [DESCRIPTION]: 'Attempt Resulting in Commission of Other Crime'
    },
    {
      [STATUTE]: '22-16-4',
      [DESCRIPTION]: 'Attempted Murder (F2)'
    },
    {
      [STATUTE]: '22-10-5.1',
      [DESCRIPTION]: 'Attempted Riot or Attempted Aggravated Riot'
    },
    {
      [STATUTE]: '22-4-1',
      [DESCRIPTION]: 'Attempts to Commit Crime (F)'
    },
    {
      [STATUTE]: '26-10-32',
      [DESCRIPTION]: 'Branding of a minor prohibited--Violation as misdemeanor or felony'
    },
    {
      [STATUTE]: '22-32-1',
      [DESCRIPTION]: 'Burglary 1st Degree(F2)'
    },
    {
      [STATUTE]: '22-32-1',
      [DESCRIPTION]: 'Burglary in First Degree Inflict Injury on Another, Possess Weapon, or Nighttime(F2)'
    },
    {
      [STATUTE]: '22-33-10',
      [DESCRIPTION]: 'Burn within Structure Where Person is Confined(F6)'
    },
    {
      [STATUTE]: '22-14A-5',
      [DESCRIPTION]: 'Carry or Place Explosives on Vehicle or in Baggage(F2)'
    },
    {
      [STATUTE]: '22-18-1.2',
      [DESCRIPTION]: 'Criminal Battery of an Unborn Child - Misdemeanor'
    },
    {
      [STATUTE]: '22-4A-1',
      [DESCRIPTION]: 'Criminal Solicitation  Of Class A, B or C Felony(F1)'
    },
    {
      [STATUTE]: '22-4A-1',
      [DESCRIPTION]: 'Criminal Solicitation of Class 1 Felony(F1)'
    },
    {
      [STATUTE]: '22-4A-1',
      [DESCRIPTION]: 'Criminal Solicitation of Class 2 Felony(F2)'
    },
    {
      [STATUTE]: '22-4A-1',
      [DESCRIPTION]: 'Criminal Solicitation of Class 3 Felony(F3)'
    },
    {
      [STATUTE]: '22-4A-1',
      [DESCRIPTION]: 'Criminal Solicitation of Class 4 Felony(F4)'
    },
    {
      [STATUTE]: '22-4A-1',
      [DESCRIPTION]: 'Criminal Solicitation of Class 5 Felony(F5)'
    },
    {
      [STATUTE]: '22-4A-1',
      [DESCRIPTION]: 'Criminal solicitation of Class 6 Felony(M1)'
    },
    {
      [STATUTE]: '22-10-6',
      [DESCRIPTION]: 'Encouraging or Soliciting Violence in Riot - Felony'
    },
    {
      [STATUTE]: '22-10-6.1',
      [DESCRIPTION]: 'Encouraging or soliciting violence in riot without participating--Felony (F5)'
    },
    {
      [STATUTE]: '22-11A-2',
      [DESCRIPTION]: 'Escape by prisoner - 1st Degree (F4)'
    },
    {
      [STATUTE]: '22-19-17',
      [DESCRIPTION]: 'False Imprisonment (M1)'
    },
    {
      [STATUTE]: '22-30-7',
      [DESCRIPTION]: 'Felony classes of robbery'
    },
    {
      [STATUTE]: '22-18-37',
      [DESCRIPTION]: 'Female Genital Mutilation - Felony'
    },
    {
      [STATUTE]: '22-16-1.1',
      [DESCRIPTION]: 'Fetal Homicide(FB)'
    },
    {
      [STATUTE]: '22-16-1',
      [DESCRIPTION]: 'Homicide Defined'
    },
    {
      [STATUTE]: '22-49-1',
      [DESCRIPTION]: 'Human Trafficking Prohibited'
    },
    {
      [STATUTE]: '22-49-2',
      [DESCRIPTION]: 'Human Trafficking(F2)'
    },
    {
      [STATUTE]: '22-18-31',
      [DESCRIPTION]: 'Intentional Exposure to HIV Infection(F3)'
    },
    {
      [STATUTE]: '22-17-6',
      [DESCRIPTION]: 'Intentional Killing of Human Fetus by Unauthorized Injury to Mother'
    },
    {
      [STATUTE]: '22-14A-11',
      [DESCRIPTION]: 'Intentional Use of Device or Explosive to Cause Serious Bodily Injury(F2)'
    },
    {
      [STATUTE]: '22-19-1.1',
      [DESCRIPTION]: 'Kidnapping - 2nd Degree(F3)'
    },
    {
      [STATUTE]: '22-19-1',
      [DESCRIPTION]: 'Kidnapping 1st Degree(FC)'
    },
    {
      [STATUTE]: '22-16-15',
      [DESCRIPTION]: 'Manslaughter in First Degree-Heat of Passion(FC)'
    },
    {
      [STATUTE]: '22-16-20',
      [DESCRIPTION]: 'Manslaughter in Second-Recklessly Killing (F4)'
    },
    {
      [STATUTE]: '22-16-4',
      [DESCRIPTION]: 'Murder in First Degree/Felony Murder(FA)'
    },
    {
      [STATUTE]: '22-16-7',
      [DESCRIPTION]: 'Murder In Second Degree-Depraved Mind(FB)'
    },
    {
      [STATUTE]: '26-10-30',
      [DESCRIPTION]: 'Parent/Guardian Permit Physical/Sexual Abuse of Child (F6)'
    },
    {
      [STATUTE]: '22-14A-20',
      [DESCRIPTION]: 'Placement of Explosive or Device as to Endanger Human Life or Safety(F4)'
    },
    {
      [STATUTE]: '22-14A-6',
      [DESCRIPTION]: 'Possession of Explosives with Intent to Injure, Intimidate, or Destroy Property(F3)'
    },
    {
      [STATUTE]: '22-16-5',
      [DESCRIPTION]: 'Premeditated Design to Effect the Death Defined'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 1st Degree - Less than 13 years of age(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 2nd Degree - Force, Coercion, Threats(F1)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 3rd Deg (DO NOT USE)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 3rd Degree - Physical or Mental Incapacity(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - 3rd Degree - V incapable of giving consent because of any Intoxicating, Narcotic, or Anesthetic Agent or Hypnosis(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - 2nd Deg, Class 1 Felony(F1)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V < 13 (1st Degree, Class C Felony)(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V = 13, but < 16, and S at least 3 yrs older than V (4th Deg, Class 3 Felony)(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V Incapable Intox/Drug (3rd deg. Class 2 Felony)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Female/Female - V Incapable Phys or Ment (3rd Deg, Class 2 Felony)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy by Force, Coercion, or Threats (F1)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy if V is Incapable because of Physical or Mental Incapacity(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy if V is Incapable of Giving Consent because of any Intoxicating, Narcotic, or Anesthetic Agent or Hypnosis(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy if Victim Less than 13 Years of Age(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape - Male/Male - Sodomy of Victim Age 13 but Less than 16 Years Old and S at Least 3 Years Older Than V(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape by Force, Coercion, or Threats or Physically Incapable of Giving Consent(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape if Victim Less Than 13 Years of Age or Intoxication Level Incapable of Consent(FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape of Victim Age 13 but Less than 16 years old and the S is at Least 3 Years Older than the V(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object if V is Incapabale because of Intoxicating, Narcotic, Anesthetic Agent or Hypnosis(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object if V is Incapable because of Physical or Mental Incapacity of Giving Consent(F2)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object if Victim Less than 13 Years of Age (FC)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object of Victim Age 13 but Less than 16 Years Old and S at Least 3 Years Older than V(F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Rape with Object Using Force, Coercion, or Threats(F1)'
    },
    {
      [STATUTE]: '22-10-1',
      [DESCRIPTION]: 'Riot (F4)'
    },
    {
      [STATUTE]: '22-30-1',
      [DESCRIPTION]: 'Robbery Defined'
    },
    {
      [STATUTE]: '22-30-6',
      [DESCRIPTION]: 'Robbery in the 2nd Degree(F4)'
    },
    {
      [STATUTE]: '22-30-7',
      [DESCRIPTION]: 'Robbery in the 2nd Degree(F4)'
    },
    {
      [STATUTE]: '22-30-6',
      [DESCRIPTION]: 'Robbery In The First Degree(F2)'
    },
    {
      [STATUTE]: '22-30-7',
      [DESCRIPTION]: 'Robbery In The First Degree(F2)'
    },
    {
      [STATUTE]: '22-49-3',
      [DESCRIPTION]: 'Second Degree Human Trafficking - Felony'
    },
    {
      [STATUTE]: '22-22-28',
      [DESCRIPTION]: 'Sexual Contact by Psychotherapist - Felony'
    },
    {
      [STATUTE]: '22-22-7',
      [DESCRIPTION]: 'Sexual Contact with Child at Least 13 Years of Age and Actor Less Than 5 years Older(M1)'
    },
    {
      [STATUTE]: '22-22-7',
      [DESCRIPTION]: 'Sexual Contact With Child Less Than 16 - Offender 16 Years of Age or Older(F3)'
    },
    {
      [STATUTE]: '22-22-7.4',
      [DESCRIPTION]: 'Sexual Contact without Consent 15 Years of Age or Older(M1)'
    },
    {
      [STATUTE]: '22-22-7.2',
      [DESCRIPTION]: 'Sexual Contact-Victim Incapable of Consent and Over 16(F4)'
    },
    {
      [STATUTE]: '22-22-24.3',
      [DESCRIPTION]: 'Sexual Exploitation of Minor (F6)'
    },
    {
      [STATUTE]: '22-22-29',
      [DESCRIPTION]: 'Sexual Penetration by Psychotherapist - Felony'
    },
    {
      [STATUTE]: '22-18-1.05',
      [DESCRIPTION]: 'Simple Assault - Against Law Enforcement Officer/Corrections/Parole/Probation(F6)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault (F6)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault (M1)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault Domestic (F6)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault Domestic (M1)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault Domestic Intimidation (M1)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault in Jail (M1)'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault Intimidation (M1)'
    },
    {
      [STATUTE]: '22-24A-5',
      [DESCRIPTION]: 'Solicitation of a Minor (F4)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking - 2nd or Subsequent Conviction (F6)'
    },
    {
      [STATUTE]: '22-19A-7',
      [DESCRIPTION]: 'Stalking - Child 12 or Younger(F6)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking (1)(M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking (2)(M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking (3)(M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking Domestic - 1st offense (M1)'
    },
    {
      [STATUTE]: '22-19A-1',
      [DESCRIPTION]: 'Stalking(M1)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Statutory rape - Victim Age 13 but Less than 16 years old and S at Least 3 years older (F3)'
    },
    {
      [STATUTE]: '22-22-1',
      [DESCRIPTION]: 'Statutory Rape - Victim Age 13 but Less than 16 years old and S at Least 3 years older (F3)'
    },
    {
      [STATUTE]: '22-22-7.7',
      [DESCRIPTION]: 'Subsequent Conviction of Rape of or Sexual Contact with a Child Under Sixteen as Felony'
    },
    {
      [STATUTE]: '22-14a-19',
      [DESCRIPTION]: 'Use of Explosive or Device to Endanger Human Life or Safety - Felony'
    },
    {
      [STATUTE]: '22-16-41',
      [DESCRIPTION]: 'Vehicular Homicide (F3)'
    },

    /* MINNEHAHA ONLY */

    {
      [STATUTE]: '22-11A-2',
      [DESCRIPTION]: 'Escape in 1st Degree'
    },
    {
      [STATUTE]: '22-14A-19',
      [DESCRIPTION]: 'Use of explosive or Device to Endanger Human Life or Safety - Felony'
    },
    {
      [STATUTE]: '22-16-4.2',
      [DESCRIPTION]: 'Murder in First Degree with Other Crimes'
    },
    {
      [STATUTE]: '22-16-9',
      [DESCRIPTION]: 'Murder in the Second Degree-Without Design Commission of Felony'
    },
    {
      [STATUTE]: '22-18-1',
      [DESCRIPTION]: 'Simple Assault-Attempt, Has Ability'
    },
    {
      [STATUTE]: '22-18-1.05(F2)',
      [DESCRIPTION]: 'Aggravated Assault on Law Enforcement Officer or Other Public Officer'
    },
    {
      [STATUTE]: '22-18-1.05(F6)',
      [DESCRIPTION]: 'Simple Assault on Law Enforcement Officer or Other Public Officer'
    },
    {
      [STATUTE]: '22-18-1.1(F2)',
      [DESCRIPTION]: 'Aggravated Assault-Child Under 3 Yrs of Age'
    },
    {
      [STATUTE]: '22-18-1.1(F2)',
      [DESCRIPTION]: 'Aggravated Assault Domestic Child Under 3 Years of Age'
    },
    {
      [STATUTE]: '22-18-1.1(F2)',
      [DESCRIPTION]: 'Simple Assault Recklessly Causes Bodily Injury'
    },
    {
      [STATUTE]: '22-18-1.2',
      [DESCRIPTION]: 'Simple Assault on an Unborn Child'
    },
    {
      [STATUTE]: '22-18-1.3',
      [DESCRIPTION]: 'Serious Injury to Unborn Child as Aggravated Assault'
    },
    {
      [STATUTE]: '22-18-1.4',
      [DESCRIPTION]: 'Serious Injury to an Infant as Aggravated Assault'
    },
    {
      [STATUTE]: '22-18-1.5',
      [DESCRIPTION]: 'Aggravated Assault with Intent to Disfigure - Felony'
    },
    {
      [STATUTE]: '22-18-1(F6)',
      [DESCRIPTION]: 'Simple Assault but Charged as Felony for 2 or more Previous Convictions Within past 5 years'
    },
    {
      [STATUTE]: '22-18-1(F6)',
      [DESCRIPTION]: 'Simple Assault by Intimidation but Charged as Felony for 2 or more Previous Convictions'
    },
    {
      [STATUTE]: '22-18-26.1',
      [DESCRIPTION]: 'Assault by Other to Cause Contact with Bodily Fluids on Law Officer-Sliming'
    },
    {
      [STATUTE]: '22-18-29(M1)',
      [DESCRIPTION]: 'Assault By A Prisoner in County Jail w/Body Fluids'
    },
    {
      [STATUTE]: '22-18-31',
      [DESCRIPTION]: 'Intentional Exposure of Another Person to HIV Infection'
    },
    {
      [STATUTE]: '22-19-1.1(F1)',
      [DESCRIPTION]: 'Aggravated Kidnapping in the Second Degree with Serious Injury as a Class 1 Felony'
    },
    {
      [STATUTE]: '22-19-1.1(F3)',
      [DESCRIPTION]: 'Kidnapping in the Second Degree as a Class 3 Felony'
    },
    {
      [STATUTE]: '22-19-1(BFel)',
      [DESCRIPTION]: 'Aggravated Kidnapping in First Degree With Serious Injury as a Class B Felony'
    },
    {
      [STATUTE]: '22-19-1(CFel)',
      [DESCRIPTION]: 'Kidnapping in the First Degree as a Class C Felony'
    },
    {
      [STATUTE]: '22-19A-2',
      [DESCRIPTION]: 'Stalking - With Protection Order or No contact or Restraining in Effect'
    },
    {
      [STATUTE]: '22-22-1.2(F1)',
      [DESCRIPTION]: 'Rape Through Use of Force, Coercion, or Threats of Bodily Harm'
    },
    {
      [STATUTE]: '22-22-1(F1)',
      [DESCRIPTION]: 'Rape 2nd Degree - Class 1 Felony'
    },
    {
      [STATUTE]: '22-22-1(F1)',
      [DESCRIPTION]: 'Rape with Object in the 2nd Degree - Class 1 Felony'
    },
    {
      [STATUTE]: '22-22-1(F1)',
      [DESCRIPTION]: 'Sodomy Rape in 2nd Degree - Class 1 Felony'
    },
    {
      [STATUTE]: '22-22-1(F2)',
      [DESCRIPTION]: 'Rape in 3rd Degree - Class 2 Felony'
    },
    {
      [STATUTE]: '22-22-1(F2)',
      [DESCRIPTION]: 'Rape With Object in 3rd Degree - Class 2 Felony'
    },
    {
      [STATUTE]: '22-22-1(F2)',
      [DESCRIPTION]: 'Sodomy Rape in 3rd Degree - Class 2 Felony'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Rape in 4th Degree - Class 3 Felony'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Rape in 4th Degree - Class 3 Felony (Statutory Rape)'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Rape with Object in 4th Degree - Class 3 Felony'
    },
    {
      [STATUTE]: '22-22-1(F3)',
      [DESCRIPTION]: 'Sodomy Rape in 4th Degree - Class 3 Felony'
    },
    {
      [STATUTE]: '22-22-1(FC)',
      [DESCRIPTION]: 'Rape in 1st Degree if Victim less than 13 - Class C Felony'
    },
    {
      [STATUTE]: '22-22-1(FC)',
      [DESCRIPTION]: 'Rape with Object in First Degree if victim less than 13 - Class C Felony'
    },
    {
      [STATUTE]: '22-22-1(FC)',
      [DESCRIPTION]: 'Sodomy Rape in 1st Degree if victim less than 13 - Class C Felony'
    },
    {
      [STATUTE]: '22-22-7.4',
      [DESCRIPTION]: 'Sexual Contact without Consent'
    },
    {
      [STATUTE]: '22-22-7(F3)',
      [DESCRIPTION]: 'Sexual Contact With Child Less Than 16 - Offender 5+ Years Older'
    },
    {
      [STATUTE]: '22-22-7(M1)',
      [DESCRIPTION]: 'Sexual Contact with Child Under 16 - Offender Less Than 5 years Older'
    },
    {
      [STATUTE]: '22-30-6(F2)',
      [DESCRIPTION]: 'Robbery In The First Degree'
    },
    {
      [STATUTE]: '22-30-6(F4)',
      [DESCRIPTION]: 'Robbery in the 2nd Degree'
    },
    {
      [STATUTE]: '22-33-1',
      [DESCRIPTION]: 'Arson 1st Degree Known to be Occupied Structure'
    },
    {
      [STATUTE]: '22-33-10',
      [DESCRIPTION]: 'Burning of Material in Structure Occupied by Lawfully Confined Subjects'
    },
    {
      [STATUTE]: '22-49-2',
      [DESCRIPTION]: 'Human Trafficking 1st Degree'
    },
    {
      [STATUTE]: '22-4A-1(F1)',
      [DESCRIPTION]: 'Solicitation of an Assault Type Crime - Class 1 Felony'
    },
    {
      [STATUTE]: '22-4A-1(F2)',
      [DESCRIPTION]: 'Solicitation of an Assault Type Crime - Class 2 Felony'
    },
    {
      [STATUTE]: '22-4A-1(F3)',
      [DESCRIPTION]: 'Solicitation of an Assault Type Crime - Class 3 Felony'
    },
    {
      [STATUTE]: '22-4A-1(F4)',
      [DESCRIPTION]: 'Solicitation of an Assault Type Crime - Class 4 Felony'
    },
    {
      [STATUTE]: '22-4A-1(F5)',
      [DESCRIPTION]: 'Solicitation of an Assault Type Crime - Class 5 Felony'
    },
    {
      [STATUTE]: '22-4A-1(F6)',
      [DESCRIPTION]: 'Solicitation of an Assault Type Crime - Class 6 Felony'
    },
    {
      [STATUTE]: '22-4A-1(M1)',
      [DESCRIPTION]: 'Solicitation of an Assault Type Crime - Class 1 Misdemeanor'
    },
    {
      [STATUTE]: '26-10-1(F3)',
      [DESCRIPTION]: 'Abuse or Cruelty to a Minor Under Age 7'
    },
    {
      [STATUTE]: '26-10-1(F4)',
      [DESCRIPTION]: 'Abuse or Cruelty to a Minor Age 7+'
    },
    {
      [STATUTE]: '26-10-32(F6)',
      [DESCRIPTION]: 'Branding of a minor prohibited - second or subsequent violation'
    },
    {
      [STATUTE]: '26-10-32(M1)',
      [DESCRIPTION]: 'Branding of a minor prohibited'
    }
  ]
};
