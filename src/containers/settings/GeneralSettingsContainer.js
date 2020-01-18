/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence } from 'redux-reqseq';
import {
  Checkbox,
  Radio,
  Select,
  CardSegment
} from 'lattice-ui-kit';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { HeaderSection } from '../../components/settings/SettingsStyledComponents';
import {
  CASE_CONTEXTS,
  CONTEXTS,
  MODULE,
  SETTINGS
} from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import { updateSetting } from './SettingsActions';

const { ENTITY_KEY_ID, NAME } = PROPERTY_TYPES;

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

const ChoiceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const StyledCell = styled.div`
  padding: 10px 10px;
  text-align: ${(props) => props.align || 'left'};
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


type Props = {
  actions :{
    updateSetting :RequestSequence;
  };
  countiesById :Map;
  editing :boolean;
  settings :Map;
};

class SettingsContainer extends React.Component<Props, State> {

  handleCheckboxUpdateSetting = (e) => {
    const { actions } = this.props;
    const { target } = e;
    const path = target.value.split(',');
    actions.updateSetting({ path, value: target.checked });
  };

  handleRadioUpdateSetting = (e) => {
    const { actions } = this.props;
    const { target } = e;
    const { name, value } = target;
    const path = name.split(',');
    actions.updateSetting({ path, value });
  };

  renderCheckbox = (path, label) => {
    const { editing, settings } = this.props;
    return (
      <StyledCell key={label + path} align="center">
        <Checkbox
            value={path}
            disabled={!editing}
            checked={settings.getIn(path, false)}
            label={label}
            onChange={this.handleCheckboxUpdateSetting} />
      </StyledCell>
    );
  }

  renderRadioButton = (path, optionValue, label) => {
    const { editing, settings } = this.props;
    return (
      <StyledCell align="center">
        <Radio
            disabled={!editing}
            name={path}
            value={optionValue}
            checked={settings.getIn(path) === optionValue}
            label={label}
            onChange={this.handleRadioUpdateSetting} />
      </StyledCell>
    );
  }

  updatePreferredCounty = (county) => {
    const { actions } = this.props;
    actions.updateSetting({ path: [SETTINGS.PREFERRED_COUNTY], value: county });
  };

  renderCountyOptions = () => {
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

  renderAdvancedSettings = () => (
    <>
      <CardSegment>
        <HeaderSection>Advanced Settings</HeaderSection>
      </CardSegment>
      <CardSegment vertical>
        <SubSection>
          <h1>Modules</h1>
          <article>
            {this.renderCheckbox([SETTINGS.MODULES, MODULE.PSA], 'PSA')}
            {this.renderCheckbox([SETTINGS.MODULES, MODULE.PRETRIAL], 'Pretrial')}
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
            {this.renderCountyOptions()}
          </article>
        </SubSection>
      </CardSegment>
    </>
  )

  render() {
    const { settings } = this.props;

    const includesBookingContext = settings.getIn([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], false);

    return (
      <CardSegment vertical>
        <SubSection>
          <h1>Contexts</h1>
          <ChoiceWrapper>
            {this.renderCheckbox([SETTINGS.CONTEXTS, CONTEXTS.COURT], 'Court')}
            {this.renderCheckbox([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], 'Booking')}
          </ChoiceWrapper>
        </SubSection>
        <SubSection>
          <h1>Case contexts</h1>
          <article>
            <RadioSection>
              <h1>Case/charge types for booking context:</h1>
              <ChoiceWrapper>
                {
                  this.renderRadioButton(
                    [SETTINGS.CASE_CONTEXTS, CONTEXTS.BOOKING],
                    CASE_CONTEXTS.ARREST, 'Arrest'
                  )
                }
                {
                  this.renderRadioButton(
                    [SETTINGS.CASE_CONTEXTS, CONTEXTS.BOOKING],
                    CASE_CONTEXTS.COURT, 'Court'
                  )
                }
              </ChoiceWrapper>
            </RadioSection>
            <RadioSection>
              <h1>Case/charge types for court context:</h1>
              <ChoiceWrapper>
                {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.COURT], CASE_CONTEXTS.ARREST, 'Arrest')}
                {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.COURT], CASE_CONTEXTS.COURT, 'Court')}
              </ChoiceWrapper>
            </RadioSection>
          </article>
        </SubSection>
        <SubSection>
          <h1>Additional RCM Guidance:</h1>
          <ChoiceWrapper>
            {this.renderCheckbox([SETTINGS.STEP_INCREASES], 'RCM Level Increases')}
            {
              includesBookingContext
                ? this.renderCheckbox(
                  [SETTINGS.SECONDARY_BOOKING_CHARGES],
                  'Secondary Booking Diversion (Hold or Release)'
                )
                : null
            }
          </ChoiceWrapper>
        </SubSection>
      </CardSegment>
    );
  }
}

function mapStateToProps(state) {
  const counties = state.get(STATE.COUNTIES);
  const settings = state.get(STATE.SETTINGS);
  return {

    /* Counties */
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),
    /* Settings */
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Submit Actions
    updateSetting
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
