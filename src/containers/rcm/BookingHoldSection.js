/*
 * @flow
 */

import React from 'react';
import type { Element } from 'react';

import styled from 'styled-components';
import { Checkbox } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';

import {
  RCM,
  RCM_DATA,
  SETTINGS
} from '../../utils/consts/AppSettingConsts';
import { updateSetting } from '../settings/SettingsActions';

const BookingHoldSectionWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, 1fr);
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
  editing :boolean;
  levels :Object;
  actions :{
    updateSetting :(value :{ path :string[], value :boolean }) => void;
  }
};

class BookingHoldSection extends React.Component<Props, *> {

  updateHoldStatusForLevel = (levelIdx :string, value :SyntheticInputEvent<HTMLInputElement>) => {
    const { actions } = this.props;
    const { target } = value;
    actions.updateSetting(
      { path: [SETTINGS.RCM, RCM.LEVELS, `${levelIdx}`, RCM_DATA.BOOKING_HOLD], value: target.checked }
    );
  }

  getColumns = () => {
    const { levels, editing } = this.props;
    const columns :Element<*>[] = Object.keys(levels).map((idx) => (
      <CellContent key={`${levels[idx][RCM_DATA.COLOR]}`} align="center">
        <Checkbox
            label={`Level ${idx}`}
            disabled={!editing}
            defaultChecked={levels[idx][RCM_DATA.BOOKING_HOLD]}
            onChange={(value) => this.updateHoldStatusForLevel(idx, value)} />
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
    updateSetting
  }, dispatch)
});
// $FlowFixMe
export default connect(null, mapDispatchToProps)(BookingHoldSection);
