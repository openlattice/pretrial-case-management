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
import * as HearingsActionFactory from '../../containers/hearings/HearingsActionFactory';
import * as ReviewActionFactory from '../../containers/review/ReviewActionFactory';

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

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
  psaEKID :string,
  personEKID :string,
  personId :string,
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
  },
  onSubmit? :(hearing :Object) => void,
  afterSubmit :() => void
}

const INITIAL_STATE = {
  newHearingCourtroom: undefined,
  newHearingDate: moment().format('MM/DD/YYYY'),
  newHearingTime: undefined,
  judge: '',
  judgeEKID: '',
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
      [HEARINGS.JUDGE]: judgeEKID
    } = this.props;
    let judge;
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
      judgeEKID
    });
  }

  submitHearing = ({
    hearingDateTime,
    hearingCoutroom,
    hearingComments,
  }) => {
    const { judgeEKID } = this.state;
    const {
      psaEKID,
      personEKID,
      actions,
      afterSubmit
    } = this.props;
    actions.submitHearing({
      hearingDateTime,
      hearingCoutroom,
      hearingComments,
      judgeEKID,
      personEKID,
      psaEKID
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
      judge
    } = this.state;
    const dateFormat = 'MM/DD/YYYY';
    const timeFormat = 'hh:mm a';
    const date = moment(newHearingDate);
    const time = moment(newHearingTime, timeFormat);
    if (date.isValid() && time.isValid()) {
      const datetime = moment(`${date.format(dateFormat)} ${time.format(timeFormat)}`, `${dateFormat} ${timeFormat}`);
      if (judge === 'Other') {
        this.setState({ judgeEKID: '' });
      }
      this.submitHearing({
        hearingDateTime: datetime.toISOString(true),
        hearingCoutroom: newHearingCourtroom,
        hearingComments: otherJudgeText
      });
      this.setState(INITIAL_STATE);
    }
  }

  isReadyToSubmit = () => {
    const {
      newHearingCourtroom,
      newHearingDate,
      newHearingTime,
      judgeEKID,
      otherJudgeText
    } = this.state;
    const judgeInfoPresent = (judgeEKID || otherJudgeText);
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

    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),

    [HEARINGS.DATE]: hearings.get(HEARINGS.DATE),
    [HEARINGS.TIME]: hearings.get(HEARINGS.TIME),
    [HEARINGS.COURTROOM]: hearings.get(HEARINGS.COURTROOM),
    [HEARINGS.JUDGE]: hearings.get(HEARINGS.JUDGE),
    [HEARINGS.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS.HEARING_NEIGHBORS_BY_ID),
    [HEARINGS.LOADING_HEARING_NEIGHBORS]: hearings.get(HEARINGS.LOADING_HEARING_NEIGHBORS),

    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(HearingsActionFactory).forEach((action :string) => {
    actions[action] = HearingsActionFactory[action];
  });

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
