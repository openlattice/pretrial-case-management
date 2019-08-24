/*
 * @flow
 */

import React from 'react';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { fromJS, Map, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestState } from 'redux-reqseq';

import BasicButton from '../../components/buttons/BasicButton';
import ContentBlock from '../../components/ContentBlock';
import ContentSection from '../../components/ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import DatePicker from '../../components/datetime/DatePicker';
import InfoButton from '../../components/buttons/InfoButton';
import LogoLoader from '../../components/LogoLoader';
import SearchableSelect from '../../components/controls/SearchableSelect';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { getCourtroomOptions, getJudgeOptions, formatJudgeName } from '../../utils/HearingUtils';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';
import { PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  getEntityKeyId,
  getEntityProperties,
  getNeighborDetailsForEntitySet,
  isUUID
} from '../../utils/DataUtils';

// Redux State Imports
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

// Action Imports
import { clearSubmittedHearing, submitHearing, updateHearing } from './HearingsActions';

const { PREFERRED_COUNTY } = SETTINGS;

const { JUDGES } = APP_TYPES;
const {
  CASE_ID,
  DATE_TIME,
  COURTROOM,
  ENTITY_KEY_ID,
} = PROPERTY_TYPES;

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
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const HearingSectionWrapper = styled.div`
  min-height: 160px;
  display: grid;
  grid-template-columns: 75% 25%;
  padding: ${props => (props.hearing ? 30 : 0)}px;
  margin: 0 -15px;
`;

const StyledBasicButton = styled(BasicButton)`
  width: 100%;
  max-width: 210px;
  height: 40px;
  margin: 10px;
  padding: 10px 25px;
  background-color: ${props => (props.update ? OL.PURPLE02 : OL.GREY08)};
  color: ${props => (props.update ? OL.WHITE : OL.GREY02)};
`;


const HearingInfoButtons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

type Props = {
  app :Map<*, *>,
  allJudges :List<*>,
  backToSelection :() => void;
  hasOutcome :boolean,
  hearing :Map<*, *>,
  hearingNeighbors :Map<*, *>,
  judgesByCounty :Map<*, *>,
  judgesById :Map<*, *>,
  updateHearingReqState :RequestState,
  psaEKID :string,
  personEKID :string,
  actions :{
    submitHearing :(values :{
      hearingDateTime :string,
      hearingCourtroom :string,
      hearingComments :string,
      judgeEKID :string,
      personEKID :string,
      psaEKID :string,
    }) => void,
    updateHearing :(values :{
      hearingEntity :Object,
      hearingEKID :string,
      judgeEKID :string,
      oldJudgeAssociationEKID :string
    }) => void,
  }
}

const DATE_FORMAT = 'MM/dd/yyyy';
const TIME_FORMAT = 'h:mm a';

const INITIAL_STATE = {
  modifyingHearing: false,
  newHearingCourtroom: undefined,
  newHearingDate: DateTime.local().toFormat(DATE_FORMAT),
  newHearingTime: undefined,
  judge: '',
  judgeEKID: '',
  otherJudgeText: '',
};


class HearingForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    const { allJudges, hearing } = this.props;
    let judgeName = '';
    let modifyingHearing = true;
    let {
      [HEARINGS_DATA.DATE]: newHearingDate,
      [HEARINGS_DATA.TIME]: newHearingTime,
      [HEARINGS_DATA.COURTROOM]: newHearingCourtroom,
      [HEARINGS_DATA.JUDGE]: judgeEKID
    } = this.props;
    if (hearing) {
      modifyingHearing = false;
      const {
        hearingDate,
        hearingTime,
        hearingCourtroom,
      } = this.getHearingInfo();
      newHearingDate = hearingDate;
      newHearingTime = hearingTime;
      newHearingCourtroom = hearingCourtroom;
    }
    const { judgeEntity } = this.getJudgeEntity();
    if (judgeEntity.size) {
      judgeEKID = getEntityKeyId(judgeEntity);
    }

    allJudges.forEach((judgeObj) => {
      const hearingJudgeEKID = getEntityKeyId(judgeObj);
      const fullNameString = formatJudgeName(judgeObj);
      if (judgeEKID === hearingJudgeEKID) judgeName = fullNameString;
    });

    this.setState({
      modifyingHearing,
      newHearingCourtroom,
      newHearingDate,
      newHearingTime,
      judge: judgeName,
      judgeEKID
    });
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSubmittedHearing();
  }

  submitHearing = () => {
    const {
      actions,
      personEKID,
      psaEKID,
      backToSelection
    } = this.props;
    const {
      newHearingDate,
      newHearingTime,
      newHearingCourtroom,
      otherJudgeText,
      judge,
      judgeEKID
    } = this.state;
    const date = DateTime.fromFormat(newHearingDate, DATE_FORMAT).toISODate();
    const time = DateTime.fromFormat(newHearingTime, TIME_FORMAT).toISOTime();
    const datetime = DateTime.fromISO(`${date}T${time}`);
    if (datetime.isValid) {
      if (judge === 'Other') {
        this.setState({ judgeEKID: '' });
      }
      const hearingDateTime = datetime.toISO();
      const hearingCourtroom = newHearingCourtroom;
      const hearingComments = otherJudgeText;
      actions.submitHearing({
        hearingDateTime,
        hearingCourtroom,
        hearingComments,
        judgeEKID,
        personEKID,
        psaEKID
      });
      this.setState(INITIAL_STATE);
    }
    if (backToSelection) backToSelection();
  }

  getHearingInfo = () => {
    const { hearing } = this.props;
    let hearingDate;
    let hearingTime;
    let hearingCourtroom;
    if (hearing) {
      const {
        [DATE_TIME]: existingHearingDateTime,
        [COURTROOM]: existingHearingCourtroom,
      } = getEntityProperties(hearing, [DATE_TIME, COURTROOM]);
      hearingDate = DateTime.fromISO(existingHearingDateTime).toFormat(DATE_FORMAT);
      hearingTime = DateTime.fromISO(existingHearingDateTime).toFormat(TIME_FORMAT);
      hearingCourtroom = existingHearingCourtroom;
    }
    return { hearingDate, hearingTime, hearingCourtroom };
  }

  getJudgeEntity = () => {
    const { hearing, hearingNeighbors } = this.props;
    let judgeEntity = Map();
    let judgeAssociationEKID;
    let judgesNameFromHearingComments;
    let judgeName;
    if (hearing && hearingNeighbors) {
      judgeEntity = getNeighborDetailsForEntitySet(hearingNeighbors, JUDGES);
      judgeAssociationEKID = hearingNeighbors.getIn([JUDGES, PSA_ASSOCIATION.DETAILS, ENTITY_KEY_ID, 0], '');
      judgesNameFromHearingComments = hearing.getIn([PROPERTY_TYPES.HEARING_COMMENTS, 0], 'N/A');
      judgeName = judgeEntity.size ? formatJudgeName(judgeEntity) : judgesNameFromHearingComments;
    }

    return {
      judgeEntity,
      judgeName,
      judgeAssociationEKID
    };
  }

  updateHearing = () => {
    const {
      actions,
      hearing
    } = this.props;
    const {
      judge,
      judgeEKID,
      newHearingDate,
      newHearingTime,
      newHearingCourtroom,
      otherJudgeText
    } = this.state;
    let judgeText;
    const judgeIsOther = (judge === 'Other');

    const { judgeEntity, judgeAssociationEKID } = this.getJudgeEntity();
    if (judgeIsOther) {
      this.setState({ judgeEKID: '' });
      judgeText = [otherJudgeText];
    }
    const { [DATE_TIME]: dateTime } = getEntityProperties(hearing, [DATE_TIME]);

    const date = newHearingDate
      ? DateTime.fromFormat(newHearingDate, DATE_FORMAT).toISODate()
      : DateTime.fromISO(dateTime).toISODate();
    const time = DateTime.fromFormat(newHearingTime, TIME_FORMAT).toISOTime()
      || DateTime.fromISO(dateTime).toISOTime();

    const hearingDateTime = DateTime.fromISO(`${date}T${time}`);

    const associationEntityKeyId = judgeEntity.size ? judgeAssociationEKID : null;
    const newHearing = {};
    if (hearingDateTime.isValid) newHearing[PROPERTY_TYPES.DATE_TIME] = [hearingDateTime.toISO()];
    if (newHearingCourtroom) newHearing[PROPERTY_TYPES.COURTROOM] = [newHearingCourtroom];
    if (judgeText) newHearing[PROPERTY_TYPES.HEARING_COMMENTS] = judgeText;

    actions.updateHearing({
      newHearing,
      oldHearing: hearing,
      judgeEKID,
      oldJudgeAssociationEKID: associationEntityKeyId
    });

    this.setState({ modifyingHearing: false });
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
    const { newHearingDate, modifyingHearing } = this.state;
    const { hearingDate } = this.getHearingInfo();
    return modifyingHearing
      ? (
        <DatePicker
            value={newHearingDate || DateTime.local().toFormat(DATE_FORMAT)}
            onChange={this.onDateChange} />
      ) : hearingDate;
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
    const { newHearingTime, modifyingHearing } = this.state;
    const { hearingTime } = this.getHearingInfo();
    return modifyingHearing
      ? (
        <StyledSearchableSelect
            options={getTimeOptions()}
            value={newHearingTime}
            onSelect={time => this.onSelectChange({
              [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_TIME,
              [HEARING_CONSTS.NEW_HEARING_TIME]: time
            })}
            short />
      ) : hearingTime;
  }

  renderCourtoomOptions = () => {
    const { newHearingCourtroom, modifyingHearing } = this.state;
    const { hearingCourtroom } = this.getHearingInfo();
    return modifyingHearing
      ? (
        <StyledSearchableSelect
            options={getCourtroomOptions()}
            value={newHearingCourtroom}
            onSelect={courtroom => this.onSelectChange({
              [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_COURTROOM,
              [HEARING_CONSTS.NEW_HEARING_COURTROOM]: courtroom
            })}
            short />
      ) : hearingCourtroom;
  }

  renderJudgeOptions = () => {
    const { app, judgesById, judgesByCounty } = this.props;
    const { judge, modifyingHearing } = this.state;
    const { judgeName } = this.getJudgeEntity();
    const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');
    const judgeIdsForCounty = judgesByCounty.get(preferredCountyEKID, List());
    return modifyingHearing
      ? (
        <StyledSearchableSelect
            options={getJudgeOptions(judgeIdsForCounty, judgesById)}
            value={judge}
            onSelect={this.onSelectChange}
            short />
      ) : judgeName;
  }

  renderOtherJudgeTextField = () => {
    const { otherJudgeText, modifyingHearing } = this.state;
    return modifyingHearing
      ? (
        <NameInput
            onChange={this.onInputChange}
            name="otherJudgeText"
            value={otherJudgeText} />
      ) : otherJudgeText;
  }

  renderCreateHearingButton = () => (
    <CreateButton disabled={!this.isReadyToSubmit()} onClick={this.submitHearing}>
      Create New
    </CreateButton>
  );

  renderUpdateAndCancelButtons = () => {
    const { modifyingHearing } = this.state;
    return modifyingHearing
      ? (
        <HearingInfoButtons modifyingHearing>
          <StyledBasicButton onClick={() => this.setState({ modifyingHearing: false })}>Cancel</StyledBasicButton>
          <StyledBasicButton update onClick={this.updateHearing}>Update</StyledBasicButton>
        </HearingInfoButtons>
      )
      : (
        <HearingInfoButtons>
          <StyledBasicButton
              onClick={() => this.setState({ modifyingHearing: true })}>
            Edit
          </StyledBasicButton>
        </HearingInfoButtons>
      );
  }

  cancelHearing = (oldHearing) => {
    const { actions, backToSelection, personEKID } = this.props;
    const newHearing = { [PROPERTY_TYPES.HEARING_INACTIVE]: [true] };
    actions.updateHearing({
      newHearing,
      oldHearing,
      personEKID
    });
    if (backToSelection) backToSelection();
  }

  renderCancelHearingButton = () => {
    const { hasOutcome, hearing } = this.props;
    const { [CASE_ID]: hearingId } = getEntityProperties(hearing, [CASE_ID, DATE_TIME]);
    const hearingWasCreatedManually = isUUID(hearingId);

    const disabledText = hearingWasCreatedManually ? 'Has Outcome' : 'Odyssey Hearing';
    const cancelButtonText = (hasOutcome || !hearingWasCreatedManually) ? disabledText : 'Cancel Hearing';
    return (
      <StyledBasicButton onClick={() => this.cancelHearing(hearing)} disabled={hasOutcome}>
        { cancelButtonText }
      </StyledBasicButton>
    );
  }

  renderBackToSelectionButton = () => {
    const { backToSelection } = this.props;
    return backToSelection
      ? <StyledBasicButton onClick={backToSelection}>Back to Selection</StyledBasicButton>
      : null;
  }

  renderCreateOrEditButtonGroups = () => {
    const { modifyingHearing } = this.state;
    const { hearing } = this.props;
    let buttonGroup = null;
    if (hearing) {
      buttonGroup = (
        <>
          { modifyingHearing ? this.renderCancelHearingButton() : null }
          { this.renderUpdateAndCancelButtons() }
        </>
      );
    }
    else {
      buttonGroup = this.renderCreateHearingButton();
    }
    return buttonGroup;
  }

  render() {
    const { hearing, updateHearingReqState } = this.props;
    const updatingHearing = requestIsPending(updateHearingReqState);
    if (updatingHearing) return <LogoLoader size={30} loadingText="Updating Hearing" />;
    const { judge } = this.state;
    const date = this.renderDatePicker();
    const time = this.renderTimeOptions();
    const courtroom = this.renderCourtoomOptions();
    const judgeSelect = this.renderJudgeOptions();
    const otherJudge = this.renderOtherJudgeTextField();

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

    const headerText = hearing ? '' : 'Create New Hearing';
    const hearingInfoContent = HEARING_ARR.map(hearingItem => (
      <ContentBlock
          component={CONTENT_CONSTS.CREATING_HEARING}
          contentBlock={hearingItem}
          key={hearingItem.label} />
    ));

    const hearingInfoSection = (
      <ContentSection
          header={headerText}
          modifyingHearing
          component={CONTENT_CONSTS.CREATING_HEARING}>
        {hearingInfoContent}
      </ContentSection>
    );

    return (
      <HearingSectionWrapper hearing={hearing}>
        {hearingInfoSection}
        <HearingSectionAside>
          { this.renderCreateOrEditButtonGroups() }
        </HearingSectionAside>
      </HearingSectionWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);
  return {
    app,

    [HEARINGS_DATA.ALL_JUDGES]: hearings.get(HEARINGS_DATA.ALL_JUDGES),
    [HEARINGS_DATA.JUDGES_BY_COUNTY]: hearings.get(HEARINGS_DATA.JUDGES_BY_COUNTY),
    [HEARINGS_DATA.JUDGES_BY_ID]: hearings.get(HEARINGS_DATA.JUDGES_BY_ID),
    [HEARINGS_DATA.DATE]: hearings.get(HEARINGS_DATA.DATE),
    [HEARINGS_DATA.TIME]: hearings.get(HEARINGS_DATA.TIME),
    [HEARINGS_DATA.COURTROOM]: hearings.get(HEARINGS_DATA.COURTROOM),
    [HEARINGS_DATA.JUDGE]: hearings.get(HEARINGS_DATA.JUDGE),
    submitExistingHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING),
    updateHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.UPDATE_HEARING)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  actions.clearSubmittedHearing = clearSubmittedHearing;
  actions.submitHearing = submitHearing;
  actions.updateHearing = updateHearing;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HearingForm);
