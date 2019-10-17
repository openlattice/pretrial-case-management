/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Checkbox } from 'lattice-ui-kit';


import {
  SETTINGS,
  RCM,
  RCM_DATA
} from '../../utils/consts/AppSettingConsts';


import { updateSetting, deleteRCMCondition } from './SettingsActions';

const BookingHoldSectionWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
`;

const CellContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-weight: 600;
  font-size: 14px;
`;

type Props = {
  data :Object,
  editing :boolean,
  levels :Object,
  actions :{
    addCondition :() => void,
    updateCondition :() => void,
    removeCondition :() => void,
  }
};

class BookingHoldSection extends React.Component<Props, *> {

  updateHoldStatusForLevel = (levelIdx, value) => {
    const { actions } = this.props;
    const { target } = value;
    actions.updateSetting(
      { path: [SETTINGS.RCM, RCM.LEVELS, `${levelIdx}`, RCM_DATA.BOOKING_HOLD], value: target.checked }
    );
  }

  getColumns = () => {
    const { levels, editing } = this.props;
    const columns = Object.keys(levels)
      .map(idx => (
        <CellContent key={`${levels[idx][RCM_DATA.COLOR]}`} align="center">
          <Checkbox
              label={`Level ${idx}`}
              disabled={!editing}
              defaultChecked={levels[idx][RCM_DATA.BOOKING_HOLD]}
              color={levels[idx][RCM_DATA.COLOR]}
              onChange={value => this.updateHoldStatusForLevel(idx, value)} />
        </CellContent>
      ));
    return columns;
  }

  render() {
    const columns = this.getColumns();

    return (
      <BookingHoldSectionWrapper columns={columns.length + 1}>
        <CellContent>
          Booking Hold
        </CellContent>
        { columns }
      </BookingHoldSectionWrapper>
    );
  }
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateSetting,
    deleteRCMCondition
  }, dispatch)
});

export default connect(null, mapDispatchToProps)(BookingHoldSection);
