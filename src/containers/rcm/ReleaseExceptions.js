/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { List } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Checkbox } from 'lattice-ui-kit';

import {
  SETTINGS,
  RCM,
  RCM_DATA
} from '../../utils/consts/AppSettingConsts';

import { updateSetting } from '../settings/SettingsActions';

const ReleaseExceptionsWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${(props :Object) => props.columns}, 1fr);
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
    updateSetting :(requestValue :Object) => void;
  }
};

class ReleaseExceptions extends React.Component<Props, *> {

  updateReleaseExceptionForLevel = (levelIdx :string, value :Object) => {
    const { actions } = this.props;
    const { target } = value;
    const requestValue :Object = {
      path: [SETTINGS.RCM, RCM.LEVELS, `${levelIdx}`, RCM_DATA.BOOKING_RELEASE_EXCEPTION],
      value: target.checked
    };
    actions.updateSetting(requestValue);
  }

  getColumns = () => {
    const { levels, editing } = this.props;
    const columns :List = Object.keys(levels)
      .map((idx) => (
        <CellContent key={`${levels[idx][RCM_DATA.COLOR]}`} align="center">
          <Checkbox
              label={`Level ${idx}`}
              disabled={!editing}
              defaultChecked={levels[idx][RCM_DATA.BOOKING_RELEASE_EXCEPTION]}
              onChange={(value) => this.updateReleaseExceptionForLevel(idx, value)} />
        </CellContent>
      ));
    return columns;
  }

  render() {
    const columns = this.getColumns();

    return (
      <ReleaseExceptionsWrapper columns={columns.length + 1}>
        <CellContent>
          Release Exceptions
        </CellContent>
        { columns }
      </ReleaseExceptionsWrapper>
    );
  }
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateSetting
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(ReleaseExceptions);
