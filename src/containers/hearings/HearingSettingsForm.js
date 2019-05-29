/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ContentBlock from '../../components/ContentBlock';
import ContentSection from '../../components/ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import DatePicker from '../../components/datetime/DatePicker';
import InfoButton from '../../components/buttons/InfoButton';
import BasicButton from '../../components/buttons/BasicButton';
import SearchableSelect from '../../components/controls/SearchableSelect';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { JURISDICTION } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import { HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { getCourtroomOptions, getJudgeOptions, formatJudgeName } from '../../utils/HearingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { getJurisdiction } from '../../utils/AppUtils';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';
import {
  APP,
  STATE,
  HEARINGS,
  COURT
} from '../../utils/consts/FrontEndStateConsts';

import * as HearingsActionFactory from './HearingsActionFactory';

const { PERSON_ID } = PROPERTY_TYPES;

const StyledSearchableSelect = styled(SearchableSelect)`
  width: 200px;
  input {
    width: 100%;
    font-size: 14px;
  }
`;

const CreateButton = styled(InfoButton)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
  margin-top: 18px;
`;

const ClearButton = styled(BasicButton)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
  margin-top: 18px;
`;

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
  background-color: ${OL.WHITE};
`;

const HearingSectionWrapper = styled.div`
  min-height: 160px;
  padding-bottom: 20px;
  margin: 0 -15px;
`;

type Props = {
  selectedOrganizationId :string,
  manuallyCreatingHearing :boolean,
  allJudges :Map<*, *>,
  actions :{
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    replaceAssociation :(values :{
      associationEntity :Map<*, *>,
      associationEntityName :string,
      associationEntityKeyId :string,
      srcEntityName :string,
      srcEntityKeyId :string,
      dstEntityName :string,
      dstEntityKeyId :string,
      callback :() => void
    }) => void
  }
}

const INITIAL_STATE = {
  newHearingCourtroom: undefined,
  newHearingDate: moment().format('MM/DD/YYYY'),
  newHearingTime: undefined,
  judge: '',
  judgeId: ''
};

class HearingSettingsForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    const {
      allJudges,
      [HEARINGS.DATE]: newHearingDate,
      [HEARINGS.TIME]: newHearingTime,
      [HEARINGS.COURTROOM]: newHearingCourtroom,
      [HEARINGS.JUDGE]: judgeId
    } = this.props;
    let judge;
    allJudges.forEach((judgeObj) => {
      const { [PERSON_ID]: hearingJudgeId } = getEntityProperties(judgeObj, [PERSON_ID]);
      const fullNameString = formatJudgeName(judgeObj);
      if (judgeId === hearingJudgeId) judge = fullNameString;
    });
    this.setState({
      newHearingCourtroom,
      newHearingDate,
      newHearingTime,
      judge,
      judgeId,
    });
  }

  isReadyToSubmit = () => {
    const {
      newHearingCourtroom,
      newHearingDate,
      newHearingTime,
      judgeId
    } = this.state;
    return (
      newHearingCourtroom
      || newHearingDate
      || newHearingTime
      || judgeId
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
          value={newHearingDate || moment()}
          onChange={this.onDateChange} />
    );
  }

  onSelectChange = (option) => {
    const optionMap = fromJS(option);
    switch (optionMap.get(HEARING_CONSTS.FIELD)) {
      case HEARING_CONSTS.JUDGE: {
        this.setState({
          [HEARING_CONSTS.JUDGE]: optionMap.get(HEARING_CONSTS.FULL_NAME),
          [HEARING_CONSTS.JUDGE_ID]: optionMap.getIn([PROPERTY_TYPES.PERSON_ID, 0])
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
      <StyledSearchableSelect
          options={getTimeOptions()}
          value={newHearingTime}
          onSelect={hearingTime => this.onSelectChange({
            [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_TIME,
            [HEARING_CONSTS.NEW_HEARING_TIME]: hearingTime
          })}
          short />
    );
  }

  renderCourtoomOptions = () => {
    const { newHearingCourtroom } = this.state;
    return (
      <StyledSearchableSelect
          options={getCourtroomOptions()}
          value={newHearingCourtroom}
          onSelect={hearingCourtroom => this.onSelectChange({
            [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_COURTROOM,
            [HEARING_CONSTS.NEW_HEARING_COURTROOM]: hearingCourtroom
          })}
          short />
    );
  }

  renderJudgeOptions = () => {
    const { allJudges, selectedOrganizationId } = this.props;
    const { judge } = this.state;
    const jurisdiction = JURISDICTION[getJurisdiction(selectedOrganizationId)];
    return (
      <StyledSearchableSelect
          options={getJudgeOptions(allJudges, jurisdiction)}
          value={judge}
          onSelect={this.onSelectChange}
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
      judgeId: judge
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
    <CreateButton disabled={!this.isReadyToSubmit()} onClick={this.setHearingSettings}>
      Save
    </CreateButton>
  );

  renderClearSettingsButton = () => {
    const { actions } = this.props;
    return (
      <ClearButton onClick={actions.clearHearingSettings}>
        Clear Settings
      </ClearButton>
    );
  }
  render() {
    const { manuallyCreatingHearing } = this.props;
    const date = this.renderDatePicker();
    const time = this.renderTimeOptions();
    const courtroom = this.renderCourtoomOptions();
    const judgeSelect = this.renderJudgeOptions();
    const createHearingButton = this.renderSaveSettingsButton();
    const clearHearingSettingsButton = this.renderClearSettingsButton();

    const HEARING_ARR = [
      {
        label: 'Date',
        content: [date]
      },
      {
        label: 'Time',
        content: [time]
      },
      {
        label: 'Courtroom',
        content: [courtroom]
      },
      {
        label: 'Judge',
        content: [judgeSelect]
      },
      {
        label: '',
        content: [createHearingButton]
      },
      {
        label: '',
        content: [clearHearingSettingsButton]
      }
    ];
    const hearingInfoContent = HEARING_ARR.map((hearingItem, idx) => (
      <ContentBlock
          component={CONTENT_CONSTS.CREATING_HEARING}
          contentBlock={hearingItem}
          key={`${hearingItem.label}-${idx}`} />
    ));

    const hearingInfoSection = (
      <ContentSection
          header="Select hearing setting for this session"
          modifyingHearing={manuallyCreatingHearing}
          component={CONTENT_CONSTS.CREATING_HEARING}>
        {hearingInfoContent}
      </ContentSection>
    );

    return (
      <HearingSectionWrapper>
        {hearingInfoSection}
      </HearingSectionWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const court = state.get(STATE.COURT);
  const hearings = state.get(STATE.HEARINGS);
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [HEARINGS.DATE]: hearings.get(HEARINGS.DATE),
    [HEARINGS.TIME]: hearings.get(HEARINGS.TIME),
    [HEARINGS.COURTROOM]: hearings.get(HEARINGS.COURTROOM),
    [HEARINGS.JUDGE]: hearings.get(HEARINGS.JUDGE)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(HearingsActionFactory).forEach((action :string) => {
    actions[action] = HearingsActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HearingSettingsForm);
