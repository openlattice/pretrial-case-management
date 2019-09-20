/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Checkbox, Radio, Select } from 'lattice-ui-kit';
import type { RequestSequence } from 'redux-reqseq';

import InfoButton from '../../components/buttons/InfoButton';
import RCMSettings from './RCMSettings';
import { PROPERTY_TYPES, APP_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  CASE_CONTEXTS,
  CONTEXTS,
  MODULE,
  SETTINGS
} from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import * as SettingsActions from './SettingsActions';
import {
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper
} from '../../utils/Layout';

const { ENTITY_KEY_ID, NAME } = PROPERTY_TYPES;

const Section = styled.div`
  width: 100%;
  padding: 30px;
  border-bottom: 1px solid ${OL.GREY11};
`;

const HeaderSection = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: ${OL.GREY01};
  width: 100%
`;

const SubSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 40px;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    color: ${OL.GREY01};
  }
`;


const StyledCell = styled.td`
  padding: 10px 10px;
  text-align: ${props => props.align || 'left'};
  word-wrap: break-word;
`;

const RadioSection = styled.div`
  margin-bottom: 10px;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: ${OL.GREY01};
  }

  article {
    margin-left: 15px;
  }
`;

const SubmitRow = styled.div`
  width: 100%;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

type Props = {
  settings :Map<*, *>,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  countiesById :Map<*, *>,
  actions :{
    loadApp :RequestSequence;
    replaceEntity :RequestSequence;
  };
};

class SettingsContainer extends React.Component<Props, State> {

  initializeSettings = () => {
    const { actions, selectedOrganizationSettings } = this.props;
    console.log(selectedOrganizationSettings.toJS());
    actions.initializeSettings({ selectedOrganizationSettings });
  }

  componentDidMount() {
    const { selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      this.initializeSettings();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== nextProps.selectedOrganizationId) {
      this.initializeSettings();
    }
  }

  renderCheckbox = (path, label) => {
    const { actions, settings } = this.props;
    return (
      <StyledCell align="center">
        <Checkbox
            checked={settings.getIn(path, false)}
            label={label}
            onChange={({ target }) => {
              actions.updateSetting({ path, value: target.checked });
            }} />
      </StyledCell>
    );
  }

  renderRadioButton = (path, optionValue, label) => {
    const { actions, settings } = this.props;

    return (
      <StyledCell align="center">
        <Radio
            value={optionValue}
            checked={settings.getIn(path) === optionValue}
            label={label}
            onChange={({ target }) => {
              actions.updateSetting({ path, value: target.value });
            }} />
      </StyledCell>
    );
  }

  updatePreferredCounty = (county) => {
    const { actions } = this.props;
    actions.updateSetting({ path: [SETTINGS.PREFERRED_COUNTY], value: county });
  };

  renderCountyFilter = () => {
    const { countiesById, settings } = this.props;
    const countyFilter = settings.get(SETTINGS.PREFERRED_COUNTY, '');
    const countyOptions :List = countiesById.entrySeq().map(([countyEKID, county]) => {
      const { [NAME]: countyName } = getEntityProperties(county, [ENTITY_KEY_ID, NAME]);
      return {
        label: countyName,
        value: countyEKID
      };
    }).toJS();
    const currentFilterValue :Object = {
      label: countiesById.getIn([countyFilter, NAME, 0], 'All'),
      value: countyFilter
    };
    return (
      <Select
          value={currentFilterValue}
          options={countyOptions}
          onChange={this.updatePreferredCounty} />
    );
  }

  submit = () => {
    const { actions, settings, selectedOrganizationSettings } = this.props;
    const settingsEKID = selectedOrganizationSettings.get(ENTITY_KEY_ID, '');

    actions.submitSettings({ settingsEKID, settings });
  }

  render() {

    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledSectionWrapper>
            <Section>
              <HeaderSection>Manage App Settings</HeaderSection>
            </Section>
            <Section>
              <SubSection>
                <h1>Modules</h1>
                <article>
                  {this.renderCheckbox([SETTINGS.MODULES, MODULE.PSA], 'PSA')}
                  {this.renderCheckbox([SETTINGS.MODULES, MODULE.PRETRIAL], 'Pretrial')}
                </article>
              </SubSection>
              <SubSection>
                <h1>Contexts</h1>
                <article>
                  {this.renderCheckbox([SETTINGS.CONTEXTS, CONTEXTS.COURT], 'Court')}
                  {this.renderCheckbox([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], 'Booking')}
                </article>
              </SubSection>
              <SubSection>
                <h1>Case contexts</h1>
                <article>
                  <RadioSection>
                    <h1>Case/charge types for booking context:</h1>
                    {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.BOOKING], CASE_CONTEXTS.ARREST, 'Arrest')}
                    {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.BOOKING], CASE_CONTEXTS.COURT, 'Court')}
                  </RadioSection>
                  <RadioSection>
                    <h1>Case/charge types for court context:</h1>
                    {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.COURT], CASE_CONTEXTS.ARREST, 'Arrest')}
                    {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.COURT], CASE_CONTEXTS.COURT, 'Court')}
                  </RadioSection>
                </article>
              </SubSection>
              <SubSection>
                <h1>Court reminders enabled</h1>
                <article>
                  {this.renderCheckbox([SETTINGS.COURT_REMINDERS], 'Enabled?')}
                </article>
              </SubSection>
              <SubSection>
                <h1>Check-in voice enrollment enabled</h1>
                <article>
                  {this.renderCheckbox([SETTINGS.ENROLL_VOICE], 'Enabled?')}
                </article>
              </SubSection>
              <SubSection>
                <h1>Load cases on the fly</h1>
                <article>
                  {this.renderCheckbox([SETTINGS.LOAD_CASES], 'Should load?')}
                </article>
              </SubSection>
              <SubSection>
                <h1>Preferred County Entity Key Id</h1>
                <article>
                  {this.renderCountyFilter()}
                </article>
              </SubSection>
            </Section>
            <SubmitRow>
              <InfoButton onClick={this.submit}>Save Changes</InfoButton>
            </SubmitRow>
            <Section>
              <RCMSettings />
            </Section>
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const counties = state.get(STATE.COUNTIES);
  const settings = state.get(STATE.SETTINGS);
  return {

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(SettingsActions).forEach((action :string) => {
    actions[action] = SettingsActions[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
