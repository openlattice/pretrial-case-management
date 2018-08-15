/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import StyledInput from '../controls/StyledInput';
import { RowWrapper, OptionsGrid } from './ReleaseConditionsStyledTags';
import { RELEASE_CONDITIONS } from '../../utils/consts/Consts';
import {
  CONDITION_LIST,
  CHECKIN_FREQUENCIES,
  C_247_TYPES
} from '../../utils/consts/ReleaseConditionConsts';

const { OTHER_CONDITION_TEXT } = RELEASE_CONDITIONS;

const SubConditionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  hr {
    margin: 20px 0 20px
  }
`;

const renderCheckInSection = mapOptionsToRadioButtons => (
  <SubConditionsWrapper>
    <h2>Check-in frequency</h2>
    <OptionsGrid numColumns={4}>
      {mapOptionsToRadioButtons(CHECKIN_FREQUENCIES, 'checkinFrequency')}
    </OptionsGrid>
    <hr />
  </SubConditionsWrapper>
);

const render247Project = mapOptionsToCheckboxButtons => (
  <SubConditionsWrapper>
    <h2>24/7 Requirements</h2>
    <h3>Must sign 24/7 Project agreement and comply with all terms and conditions.</h3>
    <OptionsGrid numColumns={3}>
      {mapOptionsToCheckboxButtons(C_247_TYPES, 'c247Types')}
    </OptionsGrid>
    <hr />
  </SubConditionsWrapper>
);

const ConditionsSection = ({
  mapOptionsToRadioButtons,
  mapOptionsToCheckboxButtons,
  handleInputChange,
  renderNoContactPeople,
  conditions,
  otherCondition,
  disabled
} :Props) => (
  <RowWrapper>
    <h1>Conditions</h1>
    <OptionsGrid numColumns={4}>
      {mapOptionsToCheckboxButtons(CONDITION_LIST, 'conditions')}
    </OptionsGrid>
    { conditions.includes(CONDITION_LIST.NO_CONTACT) ? renderNoContactPeople() : null }
    { conditions.includes(CONDITION_LIST.CHECKINS) ? renderCheckInSection(mapOptionsToRadioButtons) : null }
    { conditions.includes(CONDITION_LIST.C_247) ? render247Project(mapOptionsToCheckboxButtons) : null }
    { conditions.includes(CONDITION_LIST.OTHER) ? (
      <SubConditionsWrapper>
        <h2>Other Conditions</h2>
        <StyledInput
            name={OTHER_CONDITION_TEXT}
            value={otherCondition}
            onChange={handleInputChange}
            disabled={disabled} />
      </SubConditionsWrapper>
    ) : null }
  </RowWrapper>
);

export default ConditionsSection;
