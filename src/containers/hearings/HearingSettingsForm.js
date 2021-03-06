/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { fromJS, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  DateTimePicker,
  Input,
  Label,
  Select
} from 'lattice-ui-kit';

import { DataWrapper } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { COURTROOM_OPTIOINS, getJudgeOptions, formatJudgeName } from '../../utils/HearingUtils';
import { getEntityProperties } from '../../utils/DataUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import JUDGES_DATA from '../../utils/consts/redux/JudgeConsts';

import { setHearingSettings, closeHearingSettingsModal, clearHearingSettings } from './HearingsActions';

const { ENTITY_KEY_ID } = PROPERTY_TYPES;
const { PREFERRED_COUNTY } = SETTINGS;

const HearingSectionWrapper = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(3, 1fr);
  min-height: 160px;
  padding-bottom: 30px;
`;

type Props = {
  actions :{
    clearHearingSettings :() => void;
    closeHearingSettingsModal :() => void;
    setHearingSettings :RequestSequence;
  };
  allJudges :Map;
  app :Map;
  hearingDateTime :string;
  hearingCourtroom :string;
  hearingJudgeEKID :UUID;
  selectedOrganizationId :string;
  manuallyCreatingHearing :boolean;
  judgesById :Map;
  judgesByCounty :Map;
}

const INITIAL_STATE = {
  newHearingCourtroom: '',
  newHearingDateTime: DateTime.local().toISO(),
  judge: '',
  judgeEKID: '',
  otherJudgeText: ''
};

type State = {
  newHearingCourtroom :string,
  newHearingDateTime :string,
  judge :string;
  judgeEKID :string;
  otherJudgeText :string;
}

class HearingSettingsForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidUpdate(prevProps :Props) {
    const {
      allJudges,
      [HEARINGS_DATA.DATE_TIME]: newHearingDateTime,
      [HEARINGS_DATA.COURTROOM]: newHearingCourtroom,
      [HEARINGS_DATA.JUDGE]: judgeEKID
    } = this.props;
    const {
      [HEARINGS_DATA.DATE_TIME]: prevHearingDate,
      [HEARINGS_DATA.COURTROOM]: prevHearingCourtroom,
      [HEARINGS_DATA.JUDGE]: prevjudgeEKID
    } = prevProps;
    if (
      newHearingDateTime !== prevHearingDate
        || newHearingCourtroom !== prevHearingCourtroom
        || judgeEKID !== prevjudgeEKID
    ) {
      let judge = '';
      allJudges.forEach((judgeObj) => {
        const { [ENTITY_KEY_ID]: hearingJudgeEKID } = getEntityProperties(judgeObj, [ENTITY_KEY_ID]);
        const fullNameString = formatJudgeName(judgeObj);
        if (judgeEKID === hearingJudgeEKID) judge = fullNameString;
      });
      this.setState({
        newHearingCourtroom,
        newHearingDateTime,
        judge,
        judgeEKID,
      });
    }

  }

  componentDidMount() {
    const {
      allJudges,
      [HEARINGS_DATA.DATE_TIME]: newHearingDateTime,
      [HEARINGS_DATA.COURTROOM]: newHearingCourtroom,
      [HEARINGS_DATA.JUDGE]: judgeEKID
    } = this.props;
    let judge = '';
    allJudges.forEach((judgeObj) => {
      const { [ENTITY_KEY_ID]: hearingJudgeEKID } = getEntityProperties(judgeObj, [ENTITY_KEY_ID]);
      const fullNameString = formatJudgeName(judgeObj);
      if (judgeEKID === hearingJudgeEKID) judge = fullNameString;
    });
    this.setState({
      newHearingCourtroom,
      newHearingDateTime,
      judge,
      judgeEKID,
    });
  }

  isReadyToSubmit = () => {
    const {
      newHearingCourtroom,
      newHearingDateTime,
      judgeEKID
    } = this.state;
    return (
      newHearingCourtroom
      || newHearingDateTime
      || judgeEKID
    );
  }

  onInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  onDateChange = (hearingDate :string) => {
    this.setState({ [HEARING_CONSTS.NEW_HEARING_DATE_TIME]: hearingDate });
  }

  renderDatePicker = () => {
    const { newHearingDateTime } = this.state;
    return (
      <DateTimePicker
          ampm={false}
          onChange={this.onDateChange}
          value={newHearingDateTime} />
    );
  }

  onSelectChange = (option :Object) => {
    const optionMap = fromJS(option);
    switch (optionMap.get(HEARING_CONSTS.FIELD)) {
      case HEARING_CONSTS.JUDGE: {
        this.setState({
          [HEARING_CONSTS.JUDGE]: optionMap.getIn([HEARING_CONSTS.FULL_NAME]),
          [HEARING_CONSTS.JUDGE_ID]: optionMap.getIn([ENTITY_KEY_ID, 0])
        });
        break;
      }
      case HEARING_CONSTS.NEW_HEARING_COURTROOM: {
        this.setState({
          [HEARING_CONSTS.NEW_HEARING_COURTROOM]: optionMap.get(HEARING_CONSTS.NEW_HEARING_COURTROOM)
        });
        break;
      }
      default:
        break;
    }
  }

  renderCourtoomOptions = () => {
    const { newHearingCourtroom } = this.state;
    return (
      <Select
          options={COURTROOM_OPTIOINS}
          value={{ label: newHearingCourtroom, value: newHearingCourtroom }}
          onChange={(hearingCourtroom) => this.onSelectChange({
            [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_COURTROOM,
            [HEARING_CONSTS.NEW_HEARING_COURTROOM]: hearingCourtroom.label
          })}
          short />
    );
  }

  renderJudgeOptions = () => {
    const { judge } = this.state;
    const { app, judgesById, judgesByCounty } = this.props;
    const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');
    const judgeIdsForCounty = judgesByCounty.get(preferredCountyEKID, Set());
    return (
      <Select
          options={getJudgeOptions(judgeIdsForCounty, judgesById)}
          value={{ label: judge, value: judge }}
          onChange={(judgeOption) => this.onSelectChange(judgeOption.value)}
          short />
    );
  }

  renderOtherJudgeTextField = () => {
    const { otherJudgeText } = this.state;
    return (
      <Input
          onChange={this.onInputChange}
          name="otherJudgeText"
          value={otherJudgeText} />
    );
  }

  setHearingSettings = () => {
    const { actions } = this.props;
    const {
      newHearingDateTime: dateTime,
      newHearingCourtroom: courtroom,
      judgeEKID: judge
    } = this.state;
    actions.setHearingSettings({
      dateTime,
      courtroom,
      judge
    });
    actions.closeHearingSettingsModal();
  }

  renderSaveSettingsButton = () => (
    <Button color="secondary" disabled={!this.isReadyToSubmit()} onClick={this.setHearingSettings}>
      Save
    </Button>
  );

  renderClearSettingsButton = () => {
    const { actions } = this.props;
    return (
      <Button onClick={actions.clearHearingSettings}>
        Clear Settings
      </Button>
    );
  }
  render() {
    const date = this.renderDatePicker();
    const courtroom = this.renderCourtoomOptions();
    const judgeSelect = this.renderJudgeOptions();
    const createHearingButton = this.renderSaveSettingsButton();
    const clearHearingSettingsButton = this.renderClearSettingsButton();

    const HEARING_ARR = [
      {
        label: 'date',
        content: date
      },
      {
        label: 'courtroom',
        content: courtroom
      },
      {
        label: 'judge',
        content: judgeSelect
      },
      {
        label: '',
        content: createHearingButton
      },
      {
        label: '',
        content: clearHearingSettingsButton
      }
    ];

    const hearingInfoContent = HEARING_ARR.map((hearingItem) => (
      <DataWrapper>
        <Label subtle>{hearingItem.label}</Label>
        { hearingItem.content }
      </DataWrapper>
    ));

    return (
      <HearingSectionWrapper>
        {hearingInfoContent}
      </HearingSectionWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);
  const judges = state.get(STATE.JUDGES);
  return {
    app,
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),

    [HEARINGS_DATA.DATE_TIME]: hearings.get(HEARINGS_DATA.DATE_TIME),
    [HEARINGS_DATA.COURTROOM]: hearings.get(HEARINGS_DATA.COURTROOM),
    [HEARINGS_DATA.JUDGE]: hearings.get(HEARINGS_DATA.JUDGE),

    [JUDGES_DATA.ALL_JUDGES]: judges.get(JUDGES_DATA.ALL_JUDGES),
    [JUDGES_DATA.JUDGES_BY_COUNTY]: judges.get(JUDGES_DATA.JUDGES_BY_COUNTY),
    [JUDGES_DATA.JUDGES_BY_ID]: judges.get(JUDGES_DATA.JUDGES_BY_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    setHearingSettings,
    closeHearingSettingsModal,
    clearHearingSettings
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(HearingSettingsForm);
