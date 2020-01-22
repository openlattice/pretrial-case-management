/* @flow */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Colors, StyleUtils } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/pro-light-svg-icons';

import { StyledCell, CellContent } from '../../components/rcm/RCMStyledTags';
import { fadeTransitionStyles } from '../../components/transitions';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const { NEUTRALS } = Colors;
const { getHoverStyles } = StyleUtils;

const CheckWrapper = styled(StyledCell)`
  max-width: 25px;
`;

const ChargeRowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${NEUTRALS[4]};
  ${fadeTransitionStyles};
  ${getHoverStyles};
`;

const renderCheck = (bool :boolean) => (
  <CheckWrapper>
    {
      bool
        ? (
          <FontAwesomeIcon icon={faCheck} />
        )
        : null
    }
  </CheckWrapper>
);

type Props = {
  chargeType :string;
  data :Object;
  onClick :(selectedRowData :any) => void;
  settings :Map;
};

const ChargeRow = (props :Props) => {
  const {
    chargeType,
    data,
    onClick,
    settings
  } = props;
  const chargeTypeIsArrest = chargeType === CHARGE_TYPES.ARREST;
  const levelIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
  const bookingDiversion = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);

  return (
    <ChargeRowWrapper onClick={onClick}>
      <StyledCell><CellContent>{data.statute}</CellContent></StyledCell>
      <StyledCell><CellContent>{data.description}</CellContent></StyledCell>
      { data.violent && renderCheck(data.violent) }
      { chargeTypeIsArrest && levelIncreases && renderCheck(data.rcmIncreaseOne) }
      { chargeTypeIsArrest && levelIncreases && renderCheck(data.rcmIncreaseTwo) }
      { chargeTypeIsArrest && bookingDiversion && renderCheck(data.bhe) }
      { chargeTypeIsArrest && bookingDiversion && renderCheck(data.bre) }
    </ChargeRowWrapper>
  );
};

function mapStateToProps(state) {
  const settings = state.get(STATE.SETTINGS);
  return {
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

export default connect(mapStateToProps, null)(ChargeRow);
