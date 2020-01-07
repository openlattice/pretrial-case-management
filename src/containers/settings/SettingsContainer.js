/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StyledCheckbox from '../../components/controls/StyledCheckbox';
import StyledInput from '../../components/controls/StyledInput';
import StyledRadio from '../../components/controls/StyledRadio';
import InfoButton from '../../components/buttons/InfoButton';
import { PROPERTY_TYPES, APP_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import {
  CASE_CONTEXTS,
  CONTEXTS,
  MODULE,
  SETTINGS
} from '../../utils/consts/AppSettingConsts';
import {
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper
} from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import { replaceEntity } from '../../utils/submit/SubmitActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

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
  actions :{
    loadApp :RequestSequence;
    replaceEntity :RequestSequence;
  };
  settings :Map;
  settingsEntitySetId :string;
};

class SettingsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      settings: props.settings.delete(OPENLATTICE_ID_FQN)
    };
  }

  componentDidUpdate(prevProps) {
    const { settings } = this.props;
    if (settings !== prevProps.settings) {
      this.setState({ settings: prevProps.settings.delete(OPENLATTICE_ID_FQN) });
    }
  }

  renderCheckbox = (valuePath, label) => {
    const { settings } = this.state;
    return (
      <StyledCheckbox
          checked={settings.getIn(valuePath, false)}
          label={label}
          onChange={({ target }) => {
            this.setState({ settings: settings.setIn(valuePath, target.checked) });
          }} />
    );
  }

  renderInput = (field) => {
    const { settings } = this.state;
    return (
      <StyledInput
          value={settings.get(field, '')}
          onChange={({ target }) => {
            let { value } = target;
            if (!value) value = undefined;
            this.setState({ settings: settings.set(field, value) });
          }} />
    );
  }

  renderRadioButton = (valuePath, optionValue, label) => {
    const { settings } = this.state;

    return (
      <StyledRadio
          value={optionValue}
          checked={settings.getIn(valuePath) === optionValue}
          label={label}
          onChange={({ target }) => {
            this.setState({ settings: settings.setIn(valuePath, target.value) });
          }} />
    );
  }

  submit = () => {
    const { actions, settings, settingsEntitySetId } = this.props;

    const entityKeyId = settings.get(OPENLATTICE_ID_FQN);
    const entitySetId = settingsEntitySetId;

    const values = {
      [PROPERTY_TYPES.APP_DETAILS]: [JSON.stringify(settings.toJS())]
    };

    actions.replaceEntity({
      entityKeyId,
      entitySetId,
      values,
      callback: actions.loadApp
    });
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
                  {this.renderInput(SETTINGS.PREFERRED_COUNTY)}
                </article>
              </SubSection>
            </Section>
            <SubmitRow>
              <InfoButton onClick={this.submit}>Save Changes</InfoButton>
            </SubmitRow>
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);

  const orgId = app.get(APP_DATA.SELECTED_ORG_ID);

  let settingsEntitySetId;
  app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map()).entrySeq().forEach(([entitySetId, fqn]) => {
    if (fqn === APP_TYPES.APP_SETTINGS) {
      settingsEntitySetId = entitySetId;
    }
  });

  return {
    settings: app.getIn([APP_DATA.SETTINGS_BY_ORG_ID, orgId], Map()),
    settingsEntitySetId
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Submit Actions
    replaceEntity
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
