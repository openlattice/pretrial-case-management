/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import InfoButton from '../buttons/InfoButton';
import DatePicker from '../controls/StyledDatePicker';
import SearchableSelect from '../controls/SearchableSelect';
import { getCourtroomOptions, getJudgeOptions, HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';


const CenteredContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  input {
    width: 100%;
  }
`;

const CreateButton = styled(InfoButton)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
`;

const InputRow = styled.div`
  display: inline-flex;
  flex-direction: row;
  margin-bottom: 20px;
  width: 100%;

  section {
    width: 25%;
    padding: 0 2.5% 0 2.5%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const InputLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  text-align: left;
  color: #555e6f;
  margin-bottom: 10px;
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

const NewHearingSection = ({
  allJudges,
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
} :Props) => (
  <CenteredContainer>
    <InputRow>
      <section>
        <InputLabel>Date</InputLabel>
        <DatePicker
            value={newHearingDate}
            onChange={hearingDate => onDateChange(hearingDate)}
            clearButton={false} />
      </section>
      <section>
        <InputLabel>Time</InputLabel>
        <StyledSearchableSelect
            options={getTimeOptions()}
            value={newHearingTime}
            onSelect={hearingTime => onSelectChange({
              [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_TIME,
              [HEARING_CONSTS.NEW_HEARING_TIME]: hearingTime
            })}
            short />
      </section>
      <section>
        <InputLabel>Courtroom</InputLabel>
        <StyledSearchableSelect
            options={getCourtroomOptions()}
            value={newHearingCourtroom}
            onSelect={hearingCourtroom => onSelectChange({
              [HEARING_CONSTS.FIELD]: HEARING_CONSTS.NEW_HEARING_COURTROOM,
              [HEARING_CONSTS.NEW_HEARING_COURTROOM]: hearingCourtroom
            })}
            short />
      </section>
      <section>
        <InputLabel />
        <CreateButton disabled={!isReadyToSubmit()} onClick={selectCurrentHearing}>
          Create New
        </CreateButton>
      </section>
    </InputRow>
    <InputRow>
      <section>
        <InputLabel>Judge</InputLabel>
        <StyledSearchableSelect
            options={getJudgeOptions(allJudges, jurisdiction)}
            value={judge}
            onSelect={judgeOption => onSelectChange(judgeOption)}
            short />
      </section>
      {
        judge === 'Other'
          ? (
            <section>
              <InputLabel>Other Judge's Name</InputLabel>
              <NameInput
                  onChange={e => (onInputChange(e))}
                  name="otherJudgeText"
                  value={otherJudgeText} />
            </section>
          )
          : null
      }
    </InputRow>
  </CenteredContainer>
);

export default NewHearingSection;
