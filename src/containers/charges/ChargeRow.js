/* @flow */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Colors, StyleUtils } from 'lattice-ui-kit';

import BooleanFlag from '../../components/BooleanFlag';
import { StyledCell, CellContent } from '../../components/rcm/RCMStyledTags';
import { fadeTransitionStyles } from '../../components/transitions';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const { NEUTRALS } = Colors;
const { getHoverStyles } = StyleUtils;

const ChargeRowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${NEUTRALS[4]};
  ${fadeTransitionStyles};
  ${getHoverStyles};
`;

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
      { chargeTypeIsArrest && <StyledCell><CellContent>{data.degree}</CellContent></StyledCell> }
      { chargeTypeIsArrest && <StyledCell><CellContent>{data.short}</CellContent></StyledCell> }
      { data.violent && <StyledCell><BooleanFlag value={data.violent} /></StyledCell> }
      { chargeTypeIsArrest && levelIncreases && <StyledCell><BooleanFlag value={data.rcmIncreaseOne} /></StyledCell> }
      { chargeTypeIsArrest && levelIncreases && <StyledCell><BooleanFlag value={data.rcmIncreaseTwo} /></StyledCell> }
      { chargeTypeIsArrest && bookingDiversion && <StyledCell><BooleanFlag value={data.bhe} /></StyledCell> }
      { chargeTypeIsArrest && bookingDiversion && <StyledCell><BooleanFlag value={data.bre} /></StyledCell> }
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
