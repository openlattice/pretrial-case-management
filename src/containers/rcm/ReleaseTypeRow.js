/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Radio } from 'lattice-ui-kit';


import { StyledCell, CellContent } from '../../components/rcm/RCMStyledTags';
import { SETTINGS, RCM, RCM_DATA } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import { updateSetting, deleteRCMCondition } from './SettingsActions';

const ReleaseTypeRowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${OL.GREY11};
`;

type Props = {
  data :Object,
  editing :boolean,
  levels :Object,
  settings :Map<*, *>,
  actions :{
    addCondition :() => void,
    updateCondition :() => void,
    removeCondition :() => void,
  }
};

class ReleaseTypeRow extends React.Component<Props, *> {

  getPath = level => [SETTINGS.RCM, RCM.LEVELS, `${level}`, RCM_DATA.RELEASE_TYPE];

  handleUpdateSetting = (e) => {
    const { actions, data } = this.props;
    const { target } = e;
    const path = target.value.split(',');
    actions.updateSetting({ path, value: data.releaseType });
  };

  getColumns = () => {
    const {
      data,
      levels,
      editing,
      settings
    } = this.props;
    const columns = Object.keys(levels)
      .map((idx) => {
        const path = this.getPath(idx);
        return (
          <StyledCell key={`LEVEL${idx}`} align="center">
            <Radio
                disabled={!editing}
                value={path}
                checked={settings.getIn(path, '') === data.releaseType}
                onChange={this.handleUpdateSetting} />
          </StyledCell>
        );
      });
    return columns;
  }

  render() {
    const { data } = this.props;
    const columns = this.getColumns();

    return (
      <ReleaseTypeRowWrapper>
        <StyledCell>
          <CellContent>
            { data.description }
          </CellContent>
        </StyledCell>
        { columns }
      </ReleaseTypeRowWrapper>
    );
  }
}

function mapStateToProps(state) {
  const settings = state.get(STATE.SETTINGS);
  return {
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    updateSetting,
    deleteRCMCondition
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseTypeRow);
