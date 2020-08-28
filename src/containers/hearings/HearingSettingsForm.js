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
import { Button, Label, Select } from 'lattice-ui-kit';

import DatePicker from '../../components/datetime/DatePicker';
import { DataWrapper } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { COURTROOM_OPTIOINS, getJudgeOptions, formatJudgeName } from '../../utils/HearingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

import { setHearingSettings, closeHearingSettingsModal, clearHearingSettings } from './HearingsActions';

const { ENTITY_KEY_ID } = PROPERTY_TYPES;
const { PREFERRED_COUNTY } = SETTINGS;

const NameInput = styled.input.attrs({
  type: 'text'
})`
  width: 189px;
  height: 40px;
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.BLUE03};
  font-size: 14px;
  font-weight: 400;
  padding: 0 45px 0 20px;
  background-color: white;
`;

const HearingSectionWrapper = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(4, 1fr);
  min-height: 160px;
  padding: 30px;
`;

type Props = {
  actions :{
    clearHearingSettings :() => void;
    closeHearingSettingsModal :() => void;
    setHearingSettings :RequestSequence;
  };
  allJudges :Map;
  app :Map;
  hearingDate :string;
  hearingTime :string;
  hearingCourtroom :string;
  hearingJudge :UUID;
  selectedOrganizationId :string;
  manuallyCreatingHearing :boolean;
  judgesById :Map;
  judgesByCounty :Map;
}

const INITIAL_STATE = {
  newHearingCourtroom: '',
  newHearingDate: DateTime.local().toISO(),
  newHearingTime: '',
  judge: '',
  judgeEKID: ''
};

type State = {
  newHearingCourtroom :string,
  newHearingDate :DateTime;
  newHearingTime :string,
  judge :string;
  judgeEKID :string;
}

class HearingSettingsForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidUpdate(prevProps :Props) {
    const {
      allJudges,
      [HEARINGS_DATA.DATE]: newHearingDate,
      [HEARINGS_DATA.TIME]: newHearingTime,
      [HEARINGS_DATA.COURTROOM]: newHearingCourtroom,
      [HEARINGS_DATA.JUDGE]: judgeEKID
    } = this.props;
    const {
      [HEARINGS_DATA.DATE]: prevHearingDate,
      [HEARINGS_DATA.TIME]: prevHearingTime,
      [HEARINGS_DATA.COURTROOM]: prevHearingCourtroom,
      [HEARINGS_DATA.JUDGE]: prevjudgeEKID
    } = prevProps;
    if (
      newHearingDate !== prevHearingDate
        || newHearingTime !== prevHearingTime
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
        newHearingDate,
        newHearingTime,
        judge,
        judgeEKID,
      });
    }

  }

  componentDidMount() {
    const {
      allJudges,
      [HEARINGS_DATA.DATE]: newHearingDate,
      [HEARINGS_DATA.TIME]: newHearingTime,
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
      newHearingDate,
      newHearingTime,
      judge,
      judgeEKID,
    });
  }

  isReadyToSubmit = () => {
    const {
      newHearingCourtroom,
      newHearingDate,
      newHearingTime,
      judgeEKID
    } = this.state;
    return (
      newHearingCourtroom
      || newHearingDate
      || newHearingTime
      || judgeEKID
    );
  }

  onInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  onDateChange = (hearingDate) => {
    this.setState({ [HEARING_CONSTS.NEW_HEARING_DATE]: hearingDate });
  }

  renderDatePicker = () => {
    const { newHearingDate } = this.state;
    return (
      <DatePicker
          value={newHearingDate || DateTime.local().toISO()}
          onChange={this.onDateChange} />
    );
  }

  onSelectChange = (option) => {
    const optionMap = fromJS(option);
    switch (optionMap.get(HEARING_CONSTS.FIELD)) {
      case HEARING_CONSTS.JUDGE: {
        this.setState({
          [HEARING_CONSTS.JUDGE]: optionMap.getIn([HEARING_CONSTS.FULL_NAME]),
          [HEARING_CONSTS.JUDGE_ID]: optionMap.getIn([ENTITY_KEY_ID, 0])
        });
        break;
      }
      case HEARING_CONSTS.NEW_HEARING_TIME: {
        this.setState({
          [HEARING_CONSTS.NEW_HEARING_TIME]: optionMap.get(HEARING_CONSTS.NEW_HEARING_TIME)
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

  renderTimeOptions = () => {
    const { newHearingTime } = this.state;
    return (
      <Select
          options={getTimeOptions()}
          value={{ label: newHearingTime, value: newHearingTime }}
          onChange={(hearingTime) => this.onSelectChange({
            [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_TIME,
            [HEARING_CONSTS.NEW_HEARING_TIME]: hearingTime.label
          })}
          short />
    );
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
      <NameInput
          onChange={this.onInputChange}
          name="otherJudgeText"
          value={otherJudgeText} />
    );
  }

  setHearingSettings = () => {
    const { actions } = this.props;
    const {
      newHearingTime: time,
      newHearingDate: date,
      newHearingCourtroom: courtroom,
      judgeEKID: judge
    } = this.state;
    actions.setHearingSettings({
      date,
      time,
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
    const time = this.renderTimeOptions();
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
        label: 'time',
        content: time
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
  return {
    app,
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),

    [HEARINGS_DATA.ALL_JUDGES]: hearings.get(HEARINGS_DATA.ALL_JUDGES),
    [HEARINGS_DATA.JUDGES_BY_COUNTY]: hearings.get(HEARINGS_DATA.JUDGES_BY_COUNTY),
    [HEARINGS_DATA.JUDGES_BY_ID]: hearings.get(HEARINGS_DATA.JUDGES_BY_ID),
    [HEARINGS_DATA.DATE]: hearings.get(HEARINGS_DATA.DATE),
    [HEARINGS_DATA.TIME]: hearings.get(HEARINGS_DATA.TIME),
    [HEARINGS_DATA.COURTROOM]: hearings.get(HEARINGS_DATA.COURTROOM),
    [HEARINGS_DATA.JUDGE]: hearings.get(HEARINGS_DATA.JUDGE)
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

export default connect(mapStateToProps, mapDispatchToProps)(HearingSettingsForm);
