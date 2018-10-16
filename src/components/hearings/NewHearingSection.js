/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import InfoButton from '../buttons/InfoButton';
import DatePicker from '../controls/StyledDatePicker';
import SearchableSelect from '../controls/SearchableSelect';

import { getCourtroomOptions, getJudgeOptions, HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';

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
  type: 'otherJudgeText'
})`
  width: 189px;
  height: 40px;
  border: 1px solid #dcdce7;
  border-radius: 3px;
  color: #135;
  font-size: 14px;
  font-weight: 400;
  padding: 0 45px 0 20px;
  background-color: #ffffff;
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

const NewHearingSection = ({
  allJudges,
  manuallyCreatingHearing,
  newHearingDate,
  newHearingTime,
  newHearingCourtroom,
  judge,
  otherJudgeText,
  jurisdiction,
  onDateChange,
  onSelectChange,
  onInputChange,
  isReadyToSubmit,
  selectCurrentHearing
} :Props) => {
  let date;
  let time;
  let courtroom;
  let judgeSelect;
  let otherJudge;
  let createHearingButton;

  if (manuallyCreatingHearing) {
    date = (
      <DatePicker
          value={newHearingDate}
          onChange={hearingDate => onDateChange(hearingDate)}
          clearButton={false} />
    );

    time = (
      <StyledSearchableSelect
          options={getTimeOptions()}
          value={newHearingTime}
          onSelect={hearingTime => onSelectChange({
            [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_TIME,
            [HEARING_CONSTS.NEW_HEARING_TIME]: hearingTime
          })}
          short />
    );

    courtroom = (
      <StyledSearchableSelect
          options={getCourtroomOptions()}
          value={newHearingCourtroom}
          onSelect={hearingCourtroom => onSelectChange({
            [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_COURTROOM,
            [HEARING_CONSTS.NEW_HEARING_COURTROOM]: hearingCourtroom
          })}
          short />
    );

    judgeSelect = (
      <StyledSearchableSelect
          options={getJudgeOptions(allJudges, jurisdiction)}
          value={judge}
          onSelect={judgeOption => onSelectChange(judgeOption)}
          short />
    );

    createHearingButton = (
      <CreateButton disabled={!isReadyToSubmit()} onClick={selectCurrentHearing}>
        Create New
      </CreateButton>
    );

    otherJudge = (
      <NameInput
          onChange={e => (onInputChange(e))}
          name="otherJudgeText"
          value={otherJudgeText} />
    );
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
};

export default NewHearingSection;
