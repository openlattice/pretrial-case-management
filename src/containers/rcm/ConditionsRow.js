/* @flow */
import React from 'react';
import type { Element } from 'react';

import styled from 'styled-components';
import { faMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Button,
  Checkbox,
  Input
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';

import { CellContent, StyledCell } from '../../components/rcm/RCMStyledTags';
import { RCM, RCM_DATA, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { deleteRCMCondition, updateSetting } from '../settings/SettingsActions';

const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const minusIcon = <FontAwesomeIcon icon={faMinus} />;

const ConditionsRowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${OL.GREY11};
`;

type Props = {
  actions :{
    deleteRCMCondition :(value :{ condition :string }) => void;
    updateSetting :(value :{ path :string[], value :any }) => void;
  };
  data :Object;
  editing :boolean;
  levels :Object;
  settings :Map;
};

class ConditionsRow extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      newCondition: ''
    };
  }

  addCondition = (condition :string) => {
    const { actions, settings } = this.props;
    const conditions = settings.getIn([SETTINGS.RCM, RCM.CONDITIONS], Map());
    const nextConditions = conditions.setIn([condition, RCM_DATA.DESCRIPTION], condition);
    actions.updateSetting({ path: [SETTINGS.RCM, RCM.CONDITIONS], value: nextConditions });
  }

  updateCondition = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { actions, data, settings } = this.props;
    const conditions = settings.getIn([SETTINGS.RCM, RCM.CONDITIONS], Map());
    const { target } = e;
    const { checked, value } = target;
    const nextConditions = conditions.setIn([data[RCM_DATA.DESCRIPTION], value], checked);
    actions.updateSetting({ path: [SETTINGS.RCM, RCM.CONDITIONS], value: nextConditions });
  }

  removeCondition = (condition :string) => {
    const { actions } = this.props;
    actions.deleteRCMCondition({ condition });
  }

  getColumns = () => {
    const {
      data,
      levels,
      editing
    } = this.props;
    const columns :Element<*>[] = Object.keys(levels).map((idx) => (
      <StyledCell key={`${data.description}-LEVEL${idx}`} align="center">
        <Checkbox
            value={idx}
            disabled={!editing || !data.description}
            defaultChecked={data[idx]}
            onChange={this.updateCondition} />
      </StyledCell>
    ));
    return columns;
  }

  handleInputUpdate = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  render() {
    const {
      editing,
      data
    } = this.props;
    const { newCondition } = this.state;

    const columns = this.getColumns();

    return (
      <ConditionsRowWrapper onClick={() => {}}>
        <StyledCell>
          <CellContent>
            {
              data.description || <Input name="newCondition" value={newCondition} onChange={this.handleInputUpdate} />
            }
          </CellContent>
        </StyledCell>
        { columns }
        {
          editing ? (
            <StyledCell align="center">
              {
                data.description
                  ? (
                    <Button
                        color="error"
                        onClick={() => this.removeCondition(data.description)}>
                      { minusIcon }
                    </Button>
                  )
                  : (
                    <Button
                        color="success"
                        onClick={() => this.addCondition(newCondition)}>
                      { plusIcon }
                    </Button>
                  )
              }
            </StyledCell>
          ) : null
        }
      </ConditionsRowWrapper>
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
// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ConditionsRow);
