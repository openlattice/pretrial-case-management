/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import {
  Checkbox,
  Radio,
  Select,
  CardSegment
} from 'lattice-ui-kit';

import ChargeTable from '../../components/managecharges/ChargeTable';
import TransferPersonNeighbors from '../person/TransferPersonNeighbors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { HeaderSection } from '../../components/settings/SettingsStyledComponents';
import { InstructionalText, InstructionalSubText } from '../../components/TextStyledComponents';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import {
  CASE_CONTEXTS,
  CONTEXTS,
  MODULE,
  SETTINGS
} from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { LOAD_CHARGES } from '../charges/ChargeActions';
import { updateSetting } from './SettingsActions';

const { ENTITY_KEY_ID, NAME } = PROPERTY_TYPES;

const { ARREST, COURT } = CHARGE_TYPES;

const SubSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 40px;

  h1 {
    font-size: 16px;
    color: ${OL.GREY01};
  }
`;

const ChoiceWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const AdditionalGuidanceWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledCell = styled.div`
  padding: 10px 10px;
  text-align: ${(props :Object) => props.align || 'left'};
  word-wrap: break-word;
`;

const SectionHeader = styled(InstructionalText)`
  font-size: 24px;
`;

const SectionSubHeader = styled(InstructionalText)`
  font-size: 18px;
`;

const SectionContent = styled(InstructionalSubText)`
  font-size: 14px;
`;

const RadioSection = styled.div`
  margin-bottom: 10px;

  h1 {
    font-size: 14px;
    color: ${OL.GREY01};
  }

  article {
    margin-left: 15px;
  }
`;

type Props = {
  actions :{
    transferNeighbors :RequestSequence;
    updateSetting :RequestSequence;
  };
  bheCharges :Map;
  breCharges :Map;
  countiesById :Map;
  editing :boolean;
  loadChargesReqState :RequestState;
  maxLevelIncreaseArrestCharges :Map;
  maxLevelIncreaseCourtCharges :Map;
  settings :Map;
  singleLevelIncreaseArrestCharges :Map;
  singleLevelIncreaseCourtCharges :Map;
};

class SettingsContainer extends React.Component<Props> {

  handleCheckboxUpdateSetting = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { actions } = this.props;
    const { target } = e;
    const path = target.value.split(',');
    actions.updateSetting({ path, value: target.checked });
  };

  handleRadioUpdateSetting = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { actions } = this.props;
    const { target } = e;
    const { name, value } = target;
    const path = name.split(',');
    actions.updateSetting({ path, value });
  };

  renderCheckbox = (path :string[], label :string) => {
    const { editing, settings } = this.props;
    return (
      <StyledCell key={label + path.toString()}>
        <Checkbox
            value={path}
            disabled={!editing}
            checked={settings.getIn(path, false)}
            label={label}
            onChange={this.handleCheckboxUpdateSetting} />
      </StyledCell>
    );
  }

  renderRadioButton = (path :string[], optionValue :string, label :string) => {
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

  updatePreferredCounty = (county :string) => {
    const { actions } = this.props;
    actions.updateSetting({ path: [SETTINGS.PREFERRED_COUNTY], value: county });
  };

  renderCountyOptions = () => {
    const { countiesById, settings } = this.props;
    const countyFilter = settings.get(SETTINGS.PREFERRED_COUNTY, '');
    const countyOptions = countiesById.entrySeq().map(([countyEKID, county]) => {
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
      <TransferPersonNeighbors />
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
          <h1>Load cases on the fly</h1>
          <article>
            {this.renderCheckbox([SETTINGS.LOAD_CASES], 'Should load?')}
          </article>
        </SubSection>
        <SubSection>
          <h1>Arrests Integrated</h1>
          <article>
            {this.renderCheckbox([SETTINGS.ARRESTS_INTEGRATED], 'Enabled?')}
          </article>
        </SubSection>
        <SubSection>
          <h1>Preferred County</h1>
          <article>
            {this.renderCountyOptions()}
          </article>
        </SubSection>
      </CardSegment>
    </>
  )

  renderChargeTable = (charges :Map, chargeType :string, title :string) => {
    const { loadChargesReqState } = this.props;
    const loadingCharge = requestIsPending(loadChargesReqState);
    return (
      !!charges.size
      && (
        <>
          <SectionSubHeader>{title}</SectionSubHeader>
          <ChargeTable
              charges={charges}
              chargeType={chargeType}
              isLoading={loadingCharge}
              noQualifiers
              paginationOptions={[10]} />
        </>
      )
    );
  }

  render() {
    const {
      settings,
      maxLevelIncreaseArrestCharges,
      singleLevelIncreaseArrestCharges,
      maxLevelIncreaseCourtCharges,
      singleLevelIncreaseCourtCharges,
      bheCharges,
      breCharges
    } = this.props;

    const includesBookingContext = settings.getIn([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], false);
    return (
      <CardSegment vertical>
        <SubSection>
          <SectionHeader>PSA Context</SectionHeader>
          <SectionContent>
            The PSA context indicates the origin and purpose of the PSA creation.
            Jurisdictions can choose to implment in court and/or at booking if they choose.
          </SectionContent>
          <ChoiceWrapper>
            {this.renderCheckbox([SETTINGS.CONTEXTS, CONTEXTS.COURT], 'Court')}
            {this.renderCheckbox([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], 'Booking')}
          </ChoiceWrapper>
        </SubSection>
        <SubSection>
          <SectionHeader>Case Context</SectionHeader>
          <SectionContent>
            {
              'The case context is the type of charge that will be used for a given psa context.'
              + " In some jurisdicitons, arrest and court charges don't match exactly across systems."
              + ' For this reason, we allow the import of two sets of charges and allow individual jusrisdicitons'
              + ' the option to choose which set of charges is referenced for each context. This is especially'
              + ' important for autofill of Factor 2 (Is the current charge considered violent?) and all additional'
              + " guidance questions. To review/edit these charges, navigate tot he 'Charges' tab."
            }
          </SectionContent>
          <article>
            {
              includesBookingContext
              && (
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
              )
            }
            <RadioSection>
              <h1>Case/charge types for court context:</h1>
              <ChoiceWrapper>
                {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.COURT], CASE_CONTEXTS.ARREST, 'Arrest')}
                {this.renderRadioButton([SETTINGS.CASE_CONTEXTS, CONTEXTS.COURT], CASE_CONTEXTS.COURT, 'Court')}
              </ChoiceWrapper>
            </RadioSection>
          </article>
        </SubSection>
        {/* { this.renderAdvancedSettings() } */}
        <SubSection>
          <SectionHeader>Additional RCM Guidance</SectionHeader>
          <ChoiceWrapper>
            {this.renderCheckbox([SETTINGS.STEP_INCREASES], 'RCM Level Increases')}
            {
              includesBookingContext
                && this.renderCheckbox(
                  [SETTINGS.SECONDARY_BOOKING_CHARGES],
                  'Secondary Booking Diversion (Hold or Release)'
                )
            }
          </ChoiceWrapper>
          <AdditionalGuidanceWrapper>
            <SectionContent>
              {
                "Additional guidance options are provided at an extention of the 'Decision Framework (DF)'"
                + ' and the Release Conditions Matrix. We currenlty achieve by providing the option to implement'
                + ' an rcm level increase that individual jurisdictions deem neccesary, for qualifying charges.'
                + " To review/edit these charges, navigate tot he 'Charges' tab."
              }
            </SectionContent>
            { this.renderChargeTable(maxLevelIncreaseArrestCharges, ARREST, 'Max Level Increase Charges (Arrest)')}
            { this.renderChargeTable(maxLevelIncreaseCourtCharges, COURT, 'Max Level Increase Charges (Court)')}
            { this.renderChargeTable(
              singleLevelIncreaseArrestCharges,
              ARREST,
              'Single Level Increase Charges (Arrest)'
            )}
            { this.renderChargeTable(singleLevelIncreaseCourtCharges, COURT, 'Single Level Increase Charges (Court)')}
            {
              includesBookingContext
                ? (
                  <>
                    <SectionContent>
                      {
                        'For jurisdiction opting to implement the PSA at booking, we allow the option to provide'
                        + " flag charges that qualify for 'Secondary Release' or 'Secondary Hold'. This means that if"
                        + ' the current charge is the only qualifying charge, and is flaged as either'
                        + " 'Secondary Release' or 'Secondary Hold', the person will be automatically"
                        + ' release, or held, depending on which is'
                      }
                      flagged.
                    </SectionContent>
                    { this.renderChargeTable(bheCharges, ARREST, 'Secondary Release Charges')}
                    { this.renderChargeTable(breCharges, ARREST, 'Secondary Hold Charges')}
                  </>
                )
                : null
            }
          </AdditionalGuidanceWrapper>
        </SubSection>
      </CardSegment>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const counties = state.get(STATE.COUNTIES);
  const settings = state.get(STATE.SETTINGS);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID);
  const maxLevelIncreaseArrestCharges = charges.getIn(
    [CHARGE_DATA.ARREST_CHARGES_BY_FLAG, orgId, CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE],
    Map()
  );
  const singleLevelIncreaseArrestCharges = charges.getIn(
    [CHARGE_DATA.ARREST_CHARGES_BY_FLAG, orgId, CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE],
    Map()
  );
  const maxLevelIncreaseCourtCharges = charges.getIn(
    [CHARGE_DATA.COURT_CHARGES_BY_FLAG, orgId, CHARGE_DATA.COURT_MAX_LEVEL_INCREASE],
    Map()
  );
  const singleLevelIncreaseCourtCharges = charges.getIn(
    [CHARGE_DATA.COURT_CHARGES_BY_FLAG, orgId, CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE],
    Map()
  );
  const bheCharges = charges.getIn(
    [CHARGE_DATA.ARREST_CHARGES_BY_FLAG, orgId, CHARGE_DATA.BHE],
    Map()
  );
  const breCharges = charges.getIn(
    [CHARGE_DATA.ARREST_CHARGES_BY_FLAG, orgId, CHARGE_DATA.BRE],
    Map()
  );
  return {
    /* Charges */
    loadChargesReqState: getReqState(app, LOAD_CHARGES),
    maxLevelIncreaseArrestCharges,
    singleLevelIncreaseArrestCharges,
    maxLevelIncreaseCourtCharges,
    singleLevelIncreaseCourtCharges,
    bheCharges,
    breCharges,
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

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
