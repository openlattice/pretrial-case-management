import Immutable from 'immutable';

export const CASE_NUM = '51CRI345-238492';
export const POA_CASE_NUM = '49POA345-23984723';

export const VIOLENT_M_STATUTE = '22-18-1(1)';
export const VIOLENT_M_STATUTE_DESC = 'DOM ABUSE SIMPLE ASSAULT ATTEMPT TO CAUSE BODILY INJURY';

export const VIOLENT_F_STATUTE = '22-10-5';
export const VIOLENT_F_STATUTE_DESC = 'AGGRAVATED RIOT';

export const MISD_STATUTE = '32-12-22';
export const MISD_STATUTE_DESC = 'NO DRIVERS LICENSE';

export const FEL_STATUTE = '';
export const FEL_STATUTE_DESC = 'DRIVING UNDER INFLUENCE-3RD OF';

export const GUILTY_DISP_1 = 'Judgment on Plea of Guilty';
export const GUILTY_DISP_2 = 'Guilty But Mentally Ill';
export const GUILTY_DISP_3 = 'Suspended Imposition Revocation to Jail';
export const NOT_GUILTY_DISP_1 = 'Dismissed-Motion by Prosecutor';
export const NOT_GUILTY_DISP_2 = 'Recharged';
export const NOT_GUILTY_DISP_3 = 'Dismissal-Reduction';


/* CONVICTED CHARGES */
export const MOCK_GUILTY_MISDEMEANOR = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|1`],
  'event.OffenseLocalDescription': [MISD_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [MISD_STATUTE],
  'event.ChargeLevel': ['M2'],
  'event.ChargeLevelState': ['Class 2 Misdemeanor'],
  'justice.disposition': [GUILTY_DISP_1],
  'justice.dispositiondate': ['2018-08-01']
});

export const MOCK_GUILTY_FELONY = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|2`],
  'event.OffenseLocalDescription': [FEL_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [FEL_STATUTE],
  'event.ChargeLevel': ['F6'],
  'event.ChargeLevelState': ['Class 6 Felony'],
  'justice.disposition': [GUILTY_DISP_2],
  'justice.dispositiondate': ['2018-06-01']
});

export const MOCK_GUILTY_M_VIOLENT = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|3`],
  'event.OffenseLocalDescription': [VIOLENT_M_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [VIOLENT_M_STATUTE],
  'event.ChargeLevel': ['M1'],
  'event.ChargeLevelState': ['Class 1 Misdemeanor'],
  'justice.disposition': [GUILTY_DISP_3],
  'justice.dispositiondate': ['2018-07-01']
});

/* NOT CONVICTED CHARGES */
export const MOCK_NOT_GUILTY_MISDEMEANOR = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|4`],
  'event.OffenseLocalDescription': [MISD_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [MISD_STATUTE],
  'event.ChargeLevel': ['M2'],
  'event.ChargeLevelState': ['Class 2 Misdemeanor'],
  'justice.disposition': [NOT_GUILTY_DISP_1],
  'justice.dispositiondate': ['2018-08-01']
});

export const MOCK_NOT_GUILTY_FELONY = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|5`],
  'event.OffenseLocalDescription': [FEL_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [FEL_STATUTE],
  'event.ChargeLevel': ['F6'],
  'event.ChargeLevelState': ['Class 6 Felony'],
  'justice.disposition': [NOT_GUILTY_DISP_2],
  'justice.dispositiondate': ['2018-05-01']
});

export const MOCK_NOT_GUILTY_F_VIOLENT = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|6`],
  'event.OffenseLocalDescription': [VIOLENT_F_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [VIOLENT_F_STATUTE],
  'event.ChargeLevel': ['F3'],
  'event.ChargeLevelState': ['Class 3 Felony'],
  'justice.disposition': [NOT_GUILTY_DISP_3],
  'justice.dispositiondate': ['2018-08-01']
});

export const MOCK_SHOULD_IGNORE_MO = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|7`],
  'event.OffenseLocalDescription': ['MUNICIPAL PARK ORDINANCES'],
  'event.OffenseLocalCodeSection': ['99-2-9'],
  'event.ChargeLevel': ['MO'],
  'event.ChargeLevelState': ['Municipal Offense'],
  'justice.disposition': [NOT_GUILTY_DISP_3],
  'justice.dispositiondate': ['2018-08-01']
});

export const MOCK_SHOULD_IGNORE_PO = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|9`],
  'event.OffenseLocalDescription': ['SEAT BELT VIOLATION'],
  'event.OffenseLocalCodeSection': ['32-38-1'],
  'event.ChargeLevel': ['PO'],
  'event.ChargeLevelState': ['Petty Offense'],
  'justice.disposition': [GUILTY_DISP_1],
  'justice.dispositiondate': ['2018-08-01']
});

export const MOCK_SHOULD_IGNORE_P = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|9`],
  'event.OffenseLocalDescription': ['SEAT BELT VIOLATION'],
  'event.OffenseLocalCodeSection': ['32-38-1'],
  'event.ChargeLevel': ['P'],
  'event.ChargeLevelState': ['Petty'],
  'justice.disposition': [NOT_GUILTY_DISP_3],
  'justice.dispositiondate': ['2018-08-01']
});

export const MOCK_SHOULD_IGNORE_POA = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${POA_CASE_NUM}|9`],
  'event.OffenseLocalDescription': [MISD_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [MISD_STATUTE],
  'event.ChargeLevel': ['M1'],
  'event.ChargeLevelState': ['Class 1 Misdemeanor'],
  'justice.disposition': [GUILTY_DISP_2],
  'justice.dispositiondate': ['2018-08-01']
});

export const MOCK_PRETRIAL_CASE = Immutable.fromJS({
  'j.CaseNumberText': [CASE_NUM],
  'publicsafety.FileDate': ['2018-08-09'],
  'publicsafety.MostSeriousChargeStatuteNumber': [VIOLENT_F_STATUTE]
});
