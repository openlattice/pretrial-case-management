import React from 'react';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
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

// $FlowFixMe
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
  noQualifiers :boolean;
  onClick :(selectedRowData :any) => void;
  settings :Map;
};

const ChargeRow = (props :Props) => {
  const {
    chargeType,
    data,
    noQualifiers,
    onClick,
    settings
  } = props;
  const chargeTypeIsArrest = chargeType === CHARGE_TYPES.ARREST;
  const levelIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
  const bookingDiversion = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);

  const openCharge = () => onClick(fromJS(data.charge));

  return (
    <ChargeRowWrapper key={data.key} onClick={openCharge}>
      <StyledCell><CellContent>{data.statute}</CellContent></StyledCell>
      <StyledCell><CellContent>{data.description}</CellContent></StyledCell>
      { !noQualifiers && renderCheck(data.violent) }
      { !noQualifiers && levelIncreases && renderCheck(data.rcmMaxIncrease) }
      { !noQualifiers && levelIncreases && renderCheck(data.rcmSingleIncrease) }
      { !noQualifiers && chargeTypeIsArrest && bookingDiversion && renderCheck(data.bhe) }
      { !noQualifiers && chargeTypeIsArrest && bookingDiversion && renderCheck(data.bre) }
    </ChargeRowWrapper>
  );
};

function mapStateToProps(state) {
  const settings = state.get(STATE.SETTINGS);
  return {
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

// $FlowFixMe
export default connect(mapStateToProps, null)(ChargeRow);
