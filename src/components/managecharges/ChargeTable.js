/*
 * @flow
 */
import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'lattice-ui-kit';

import ChargeRow from '../../containers/charges/ChargeRow';
import { getEntityProperties } from '../../utils/DataUtils';
import { NoResults } from '../../utils/Layout';
import { CHARGE_TYPES, CHARGE_HEADERS } from '../../utils/consts/ChargeConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const {
  ENTITY_KEY_ID,
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION,
  REFERENCE_CHARGE_LEVEL,
  REFERENCE_CHARGE_DEGREE,
  CHARGE_IS_VIOLENT,
  CHARGE_RCM_STEP_2,
  CHARGE_RCM_STEP_4,
  BHE,
  BRE
} = PROPERTY_TYPES;

const BASE_CHARGE_HEADERS = [
  { label: CHARGE_HEADERS.STATUTE, key: REFERENCE_CHARGE_STATUTE },
  { label: CHARGE_HEADERS.DESCRIPTION, key: REFERENCE_CHARGE_DESCRIPTION, cellStyle: { width: '350px' } },
  { label: CHARGE_HEADERS.VIOLENT, key: CHARGE_IS_VIOLENT }
];

const LEVEL_INCREASE_HEADERS = [
  { label: CHARGE_HEADERS.STEP_2, key: CHARGE_RCM_STEP_2 },
  { label: CHARGE_HEADERS.STEP_2, key: CHARGE_RCM_STEP_4 },
];

const BOOKING_DIVERSION_HEADERS = [
  { label: CHARGE_HEADERS.BHE, key: BHE },
  { label: CHARGE_HEADERS.BRE, key: BRE },
];

class ChargeTable extends React.Component<Props, State> {
  getHeaders = () => {
    let headers = BASE_CHARGE_HEADERS;

    const { settings, chargeType } = this.props;
    const levelIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    const bookingDiversion = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);

    if (chargeType === CHARGE_TYPES.ARREST) {
      if (levelIncreases) headers = headers.concat(LEVEL_INCREASE_HEADERS);
      if (bookingDiversion) headers = headers.concat(BOOKING_DIVERSION_HEADERS);
    }
    return headers;
  }

  getFormattedCharges = () => {
    const { charges, chargeType, settings } = this.props;
    const levelIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    const bookingDiversion = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);
    const chargeOptions = charges.valueSeq().map((charge) => {
      const {
        [ENTITY_KEY_ID]: key,
        [REFERENCE_CHARGE_STATUTE]: statute,
        [REFERENCE_CHARGE_DESCRIPTION]: description,
        [CHARGE_IS_VIOLENT]: violent,
        [REFERENCE_CHARGE_DEGREE]: degree,
        [REFERENCE_CHARGE_LEVEL]: short,
        [CHARGE_RCM_STEP_2]: rcmIncreaseOne,
        [CHARGE_RCM_STEP_4]: rcmIncreaseTwo,
        [BHE]: bhe,
        [BRE]: bre,
      } = getEntityProperties(charge, [
        REFERENCE_CHARGE_STATUTE,
        REFERENCE_CHARGE_DESCRIPTION,
        REFERENCE_CHARGE_LEVEL,
        REFERENCE_CHARGE_DEGREE,
        CHARGE_IS_VIOLENT,
        CHARGE_RCM_STEP_2,
        CHARGE_RCM_STEP_4,
        BHE,
        BRE
      ]);
      const returnCharge = {
        description,
        key,
        statute,
        violent
      };
      if (chargeType === CHARGE_TYPES.ARREST) {
        returnCharge.degree = degree;
        returnCharge.degree = short;
        if (levelIncreases) {
          returnCharge.rcmIncreaseOne = rcmIncreaseOne;
          returnCharge.rcmIncreaseTwo = rcmIncreaseTwo;
        }
        if (bookingDiversion) {
          returnCharge.bhe = bhe;
          returnCharge.bre = bre;
        }
      }
      return returnCharge;
    });
    return chargeOptions;
  }

  render() {
    const {
      chargeType,
      charges
    } = this.props;
    if (!charges.size) return <NoResults>No Results</NoResults>;

    const components :Object = {
      Row: ({ data } :any) => (
        <ChargeRow chargeType={chargeType} data={data} />
      )
    };

    return (
      <Table
          components={components}
          headers={this.getHeaders()}
          data={this.getFormattedCharges()} />
    );
  }
}

function mapStateToProps(state) {
  const settings = state.get(STATE.SETTINGS);
  return {
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

export default connect(mapStateToProps, null)(ChargeTable);
