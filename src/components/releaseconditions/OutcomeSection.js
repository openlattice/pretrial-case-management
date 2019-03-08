/*
 * @flow
 */
import React from 'react';

import { RowWrapper, OptionsGrid, Row } from './ReleaseConditionsStyledTags';
import StyledInput from '../controls/StyledInput';
import { RELEASE_CONDITIONS } from '../../utils/consts/Consts';
import { OUTCOMES } from '../../utils/consts/ReleaseConditionConsts';

const { OTHER_OUTCOME_TEXT } = RELEASE_CONDITIONS;

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string) => void,
  handleInputChange :(event :Object) => void,
  outcome :String,
  otherOutcome :String,
  disabled :boolean
};

const OutcomeSection = ({
  mapOptionsToRadioButtons,
  handleInputChange,
  outcome,
  otherOutcome,
  disabled
} :Props) => (
  <RowWrapper>
    <h1>Outcome</h1>
    <OptionsGrid numColumns={5}>
      {mapOptionsToRadioButtons(OUTCOMES, 'outcome')}
    </OptionsGrid>
    {
      outcome === OUTCOMES.OTHER ?
        (
          <Row>
            <h3>Outcome</h3>
            <StyledInput
                disabled={disabled}
                name={OTHER_OUTCOME_TEXT}
                value={otherOutcome}
                onChange={handleInputChange} />
          </Row>
        )
        : null
    }
  </RowWrapper>
);

export default OutcomeSection;
