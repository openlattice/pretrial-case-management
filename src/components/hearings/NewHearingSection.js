/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { fromJS, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import DatePicker from '../datetime/DatePicker';
import InfoButton from '../buttons/InfoButton';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import SearchableSelect from '../controls/SearchableSelect';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { getCourtroomOptions, getJudgeOptions, formatJudgeName } from '../../utils/HearingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';
import {
  STATE,
  HEARINGS,
  REVIEW,
  COURT
} from '../../utils/consts/FrontEndStateConsts';
import {
  FORM_IDS,
  ID_FIELD_NAMES,
  HEARING,
  HEARING_TYPES
} from '../../utils/consts/Consts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as ReviewActionFactory from '../../containers/review/ReviewActionFactory';

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
  margin-top: 50px;
  padding-left: 0;
  padding-right: 0;
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

const HearingSectionAside = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HearingSectionWrapper = styled.div`
  min-height: 160px;
  display: grid;
  grid-template-columns: 75% 25%;
  padding-bottom: 20px;
  margin: 0 -15px;
`;

type Props = {
  app :Map<*, *>,
  allJudges :List<*, *>,
  jurisdiction :string,
  manuallyCreatingHearing :boolean,
  psaId :string,
  psaEntityKeyId :string,
  personId :string,
  actions :{
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    refreshHearingNeighbors :({ id :string }) => void,
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
  },
  onSubmit? :(hearing :Object) => void,
  afterSubmit :() => void
}

const INITIAL_STATE = {
  newHearingCourtroom: undefined,
  newHearingDate: moment().format('MM/DD/YYYY'),
  newHearingTime: undefined,
  judge: '',
  otherJudgeText: '',
};

class NewHearingSection extends React.Component<Props, State> {

  static defaultProps = {
    onSubmit: () => {}
  }

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
      const { [PROPERTY_TYPES.PERSON_ID]: hearingJudgeId } = getEntityProperties(judgeObj, [PROPERTY_TYPES.PERSON_ID]);
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

  selectHearing = (hearingDetails) => {
    const {
      app,
      psaId,
      personId,
      psaEntityKeyId,
      actions,
      afterSubmit
    } = this.props;

    const values = Object.assign({}, hearingDetails, {
      [ID_FIELD_NAMES.PSA_ID]: psaId,
      [FORM_IDS.PERSON_ID]: personId
    });

    const callback = psaEntityKeyId ? () => actions.refreshPSANeighbors({ id: psaEntityKeyId }) : () => {};
    actions.submit({
      app,
      values,
      config: psaHearingConfig,
      callback
    });
    if (afterSubmit) afterSubmit();
  }

  selectCurrentHearing = () => {
    const { onSubmit } = this.props;
    const {
      newHearingDate,
      newHearingTime,
      newHearingCourtroom,
      otherJudgeText,
      judge,
      judgeId
    } = this.state;
    const dateFormat = 'MM/DD/YYYY';
    const timeFormat = 'hh:mm a';
    const date = moment(newHearingDate);
    const time = moment(newHearingTime, timeFormat);
    let judgeName = judge;
    if (date.isValid() && time.isValid()) {
      const datetime = moment(`${date.format(dateFormat)} ${time.format(timeFormat)}`, `${dateFormat} ${timeFormat}`);
      let hearing = {
        [ID_FIELD_NAMES.HEARING_ID]: randomUUID(),
        [HEARING.DATE_TIME]: datetime.toISOString(true),
        [HEARING.COURTROOM]: newHearingCourtroom,
        [PROPERTY_TYPES.HEARING_TYPE]: HEARING_TYPES.INITIAL_APPEARANCE
      };
      if (judge === 'Other') {
        this.setState({ judgeId: '' });
        judgeName = otherJudgeText;
        hearing = Object.assign({}, hearing, {
          [PROPERTY_TYPES.HEARING_COMMENTS]: otherJudgeText
        });
      }
      else {
        hearing = Object.assign({}, hearing, {
          [ID_FIELD_NAMES.TIMESTAMP]: moment().toISOString(true),
          [ID_FIELD_NAMES.JUDGE_ID]: judgeId
        });
      }
      this.selectHearing(hearing);
      const hearingForRender = Object.assign({}, hearing, { judgeName });
      onSubmit(hearingForRender);
      this.setState(INITIAL_STATE);
    }
  }

  isReadyToSubmit = () => {
    const {
      newHearingCourtroom,
      newHearingDate,
      newHearingTime,
      judgeId,
      otherJudgeText
    } = this.state;
    const judgeInfoPresent = (judgeId || otherJudgeText);
    return (
      newHearingCourtroom
      && newHearingDate
      && newHearingTime
      && judgeInfoPresent
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
          value={newHearingDate || moment().format('MM/DD/YYYY')}
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
    const { allJudges, jurisdiction } = this.props;
    const { judge } = this.state;
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

  renderCreateHearingButton = () => (
    <CreateButton disabled={!this.isReadyToSubmit()} onClick={this.selectCurrentHearing}>
      Create New
    </CreateButton>
  );

  render() {
    const { manuallyCreatingHearing } = this.props;
    const { judge } = this.state;
    let date;
    let time;
    let courtroom;
    let judgeSelect;
    let otherJudge;
    let createHearingButton;

    if (manuallyCreatingHearing) {
      date = this.renderDatePicker();
      time = this.renderTimeOptions();
      courtroom = this.renderCourtoomOptions();
      judgeSelect = this.renderJudgeOptions();
      createHearingButton = this.renderCreateHearingButton();
      otherJudge = this.renderOtherJudgeTextField();
    }

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
      }
    ];
    if (judge === 'Other') {
      HEARING_ARR.push(
        {
          label: "Other Judge's Name",
          content: [otherJudge]
        }
      );
    }
    const hearingInfoContent = HEARING_ARR.map(hearingItem => (
      <ContentBlock
          component={CONTENT_CONSTS.CREATING_HEARING}
          contentBlock={hearingItem}
          key={hearingItem.label} />
    ));

    const hearingInfoSection = (
      <ContentSection
          header="Create New Hearing"
          modifyingHearing={manuallyCreatingHearing}
          component={CONTENT_CONSTS.CREATING_HEARING}>
        {hearingInfoContent}
      </ContentSection>
    );

    return (
      <HearingSectionWrapper>
        {hearingInfoSection}
        <HearingSectionAside>
          {createHearingButton}
        </HearingSectionAside>
      </HearingSectionWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const court = state.get(STATE.COURT);
  const hearings = state.get(STATE.HEARINGS);
  const review = state.get(STATE.REVIEW);
  return {
    app,

    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),

    [HEARINGS.DATE]: hearings.get(HEARINGS.DATE),
    [HEARINGS.TIME]: hearings.get(HEARINGS.TIME),
    [HEARINGS.COURTROOM]: hearings.get(HEARINGS.COURTROOM),
    [HEARINGS.JUDGE]: hearings.get(HEARINGS.JUDGE),

    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewHearingSection);
