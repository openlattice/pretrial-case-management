/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import type { Element } from 'react';
import { Colors, Radio, TextArea } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/pro-solid-svg-icons';

import ExpandableText from '../controls/ExpandableText';

import { NOTES } from '../../utils/consts/Consts';
import { getJustificationText } from '../../utils/AutofillUtils';

const { NEUTRAL, PURPLE } = Colors;

const QuestionRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  border-bottom: ${(props :Object) => (props.highlight ? 'none' : `solid 1px ${NEUTRAL.N100} !important`)};
  border: ${(props :Object) => (props.highlight ? `solid 1px ${PURPLE.P300}` : 'none')};
`;

const PaddedExpandableText = styled(ExpandableText)`
  margin: 5px 0 10px 0;
`;

const Number = styled.div`
  display: flex;
  align-items: center;
`;

const RequiredFieldWarning = styled.section`
  color: ${PURPLE.P300};
  display: flex;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  align-items: center;

  svg {
    padding: 0 5px 0 10px;
  }
`;

const StyledTextArea = styled(TextArea)`
  font-size: 12px;
  max-width: 450px;
  min-height: 115px;
`;

const Prompt = styled.div`
  color: ${NEUTRAL.N700};
  font-size: 16px;
  padding: 0 20px 20px 0;

  div {
    width: 100% !important;
  }
`;

const PromptRadioWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PromptNotesWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;

  div {
    width: 100%;
  }

  ${Prompt} {
    width: 100%;
  }

  input {
    width: 50%;
  }
`;

const Justifications = styled.div`
  width: 100%;

  h1 {
    color: ${NEUTRAL.N700};
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 5px;
    text-transform: uppercase;
  }

  div {
    color: ${NEUTRAL.N600};
    font-size: 14px;
  }
`;

const QuestionLabels = styled.div`
  display: flex;

  div {
    color: ${NEUTRAL.N700};
    font-size: 14px;
    margin-bottom: 10px;
    width: 50%;
  }

  div:first-child {
    font-weight: 600;
  }

  div:last-child {
    font-weight: 300;
  }
`;

const InlineFormGroup = styled.div`
  display: flex;
  margin-bottom: 30px;

  label {
    margin-right: 10px;
  }
`;

type Props = {
  disabledField :?boolean;
  field :string;
  handleInputChange :(event :Object) => void;
  input :Map;
  justificationHeader :?string;
  justifications :?List;
  radioLabelMappings :Object;
  num :number;
  prompt :string | Element<*>;
  viewOnly :boolean;
};

const PSAQuestionRow = ({
  disabledField,
  field,
  handleInputChange,
  input,
  justificationHeader,
  justifications,
  radioLabelMappings,
  num,
  prompt,
  viewOnly,
} :Props) => {

  // Only render autojustification if app settings loads historical charges
  const rowNumFormatted :string = num < 10 ? `0${num}` : `${num}`;
  const notesValue :string = input.get(NOTES[field]);
  const justificationText :string = getJustificationText(justifications, justificationHeader);
  const mappingKeys = Object.keys(radioLabelMappings);
  const inputValue = input.get(field);
  const noValue = !mappingKeys.includes(inputValue);

  return (
    <QuestionRow highlight={noValue}>
      <QuestionLabels>
        <Number>
          { rowNumFormatted }
          {
            noValue
              ? (
                <RequiredFieldWarning>
                  <FontAwesomeIcon icon={faExclamationCircle} color={PURPLE.P300} size="2x" />
                  Required
                </RequiredFieldWarning>
              ) : null
          }
        </Number>
        <div>Notes</div>
      </QuestionLabels>
      <PromptNotesWrapper>
        <PromptRadioWrapper>
          <Prompt>{ prompt }</Prompt>
          <InlineFormGroup>
            {
              mappingKeys
                .map((value :string) => (
                  <Radio
                      key={`${field}-${value}`}
                      checked={input.get(field) === `${value}`}
                      disabled={viewOnly || (disabledField && disabledField !== undefined)}
                      input={input}
                      label={radioLabelMappings[value]}
                      mode="button"
                      name={field}
                      onChange={handleInputChange}
                      value={`${value}`} />
                ))
            }
          </InlineFormGroup>
        </PromptRadioWrapper>
        {
          viewOnly && notesValue
            ? (
              <PaddedExpandableText text={notesValue} maxLength={250} />
            )
            : (
              <StyledTextArea
                  disabled={viewOnly}
                  name={NOTES[field]}
                  onChange={handleInputChange}
                  value={notesValue} />
            )
        }
      </PromptNotesWrapper>
      {
        justificationText && (
          <Justifications>
            <h1>AUTOFILL JUSTIFICATION</h1>
            <PaddedExpandableText text={justificationText} maxLength={220} />
          </Justifications>
        )
      }
    </QuestionRow>
  );
};

PSAQuestionRow.defaultProps = {
  disabledField: false,
  justificationHeader: '',
  justifications: List(),
};

export default PSAQuestionRow;
