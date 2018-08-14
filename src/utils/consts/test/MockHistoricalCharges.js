import Immutable from 'immutable';

import {
  DATE_2,
  DATE_3,
  CASE_NUM,
  POA_CASE_NUM
} from './MockPretrialCases';

import {
  VIOLENT_M_STATUTE,
  VIOLENT_M_STATUTE_DESC,

  VIOLENT_F_STATUTE,
  VIOLENT_F_STATUTE_DESC,

  MISD_STATUTE,
  MISD_STATUTE_DESC,

  FEL_STATUTE,
  FEL_STATUTE_DESC,

  GUILTY_DISP_1,
  GUILTY_DISP_2,
  GUILTY_DISP_3,
  NOT_GUILTY_DISP_1,
  NOT_GUILTY_DISP_2,
  NOT_GUILTY_DISP_3
} from './MockHistoricalChargeFields';

/* CONVICTED CHARGES */
export const MOCK_GUILTY_MISDEMEANOR = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|1`],
  'event.OffenseLocalDescription': [MISD_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [MISD_STATUTE],
  'event.ChargeLevel': ['M2'],
  'event.ChargeLevelState': ['Class 2 Misdemeanor'],
  'justice.disposition': [GUILTY_DISP_1],
  'justice.dispositiondate': [DATE_2]
});

export const MOCK_GUILTY_FELONY = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|2`],
  'event.OffenseLocalDescription': [FEL_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [FEL_STATUTE],
  'event.ChargeLevel': ['F6'],
  'event.ChargeLevelState': ['Class 6 Felony'],
  'justice.disposition': [GUILTY_DISP_2],
  'justice.dispositiondate': [DATE_2]
});

export const MOCK_GUILTY_M_VIOLENT = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|3`],
  'event.OffenseLocalDescription': [VIOLENT_M_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [VIOLENT_M_STATUTE],
  'event.ChargeLevel': ['M1'],
  'event.ChargeLevelState': ['Class 1 Misdemeanor'],
  'justice.disposition': [GUILTY_DISP_3],
  'justice.dispositiondate': [DATE_2]
});

export const MOCK_M_NO_DISPOSITION = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|4`],
  'event.OffenseLocalDescription': [MISD_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [MISD_STATUTE],
  'event.ChargeLevel': ['M2'],
  'event.ChargeLevelState': ['Class 2 Misdemeanor']
});

/* NOT CONVICTED CHARGES */
export const MOCK_NOT_GUILTY_MISDEMEANOR = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|5`],
  'event.OffenseLocalDescription': [MISD_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [MISD_STATUTE],
  'event.ChargeLevel': ['M2'],
  'event.ChargeLevelState': ['Class 2 Misdemeanor'],
  'justice.disposition': [NOT_GUILTY_DISP_1],
  'justice.dispositiondate': [DATE_3]
});

export const MOCK_NOT_GUILTY_FELONY = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|6`],
  'event.OffenseLocalDescription': [FEL_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [FEL_STATUTE],
  'event.ChargeLevel': ['F6'],
  'event.ChargeLevelState': ['Class 6 Felony'],
  'justice.disposition': [NOT_GUILTY_DISP_2],
  'justice.dispositiondate': [DATE_3]
});

export const MOCK_NOT_GUILTY_F_VIOLENT = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|7`],
  'event.OffenseLocalDescription': [VIOLENT_F_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [VIOLENT_F_STATUTE],
  'event.ChargeLevel': ['F3'],
  'event.ChargeLevelState': ['Class 3 Felony'],
  'justice.disposition': [NOT_GUILTY_DISP_3],
  'justice.dispositiondate': [DATE_3]
});

export const MOCK_SHOULD_IGNORE_MO = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|8`],
  'event.OffenseLocalDescription': ['MUNICIPAL PARK ORDINANCES'],
  'event.OffenseLocalCodeSection': ['99-2-9'],
  'event.ChargeLevel': ['MO'],
  'event.ChargeLevelState': ['Municipal Offense'],
  'justice.disposition': [NOT_GUILTY_DISP_3],
  'justice.dispositiondate': [DATE_3]
});

export const MOCK_SHOULD_IGNORE_PO = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|9`],
  'event.OffenseLocalDescription': ['SEAT BELT VIOLATION'],
  'event.OffenseLocalCodeSection': ['32-38-1'],
  'event.ChargeLevel': ['PO'],
  'event.ChargeLevelState': ['Petty Offense'],
  'justice.disposition': [GUILTY_DISP_1],
  'justice.dispositiondate': [DATE_2]
});

export const MOCK_SHOULD_IGNORE_P = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${CASE_NUM}|10`],
  'event.OffenseLocalDescription': ['SEAT BELT VIOLATION'],
  'event.OffenseLocalCodeSection': ['32-38-1'],
  'event.ChargeLevel': ['P'],
  'event.ChargeLevelState': ['Petty'],
  'justice.disposition': [NOT_GUILTY_DISP_3],
  'justice.dispositiondate': [DATE_3]
});

export const MOCK_SHOULD_IGNORE_POA = Immutable.fromJS({
  'justice.ArrestTrackingNumber': [`${POA_CASE_NUM}|1`],
  'event.OffenseLocalDescription': [MISD_STATUTE_DESC],
  'event.OffenseLocalCodeSection': [MISD_STATUTE],
  'event.ChargeLevel': ['M1'],
  'event.ChargeLevelState': ['Class 1 Misdemeanor'],
  'justice.disposition': [GUILTY_DISP_2],
  'justice.dispositiondate': [DATE_3]
});
