/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import type { Element } from 'react';
import { Radio } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/pro-solid-svg-icons';

import ExpandableText from '../controls/ExpandableText';
import StyledInput from '../controls/StyledInput';

import { OL } from '../../utils/consts/Colors';
import { NOTES } from '../../utils/consts/Consts';
import { getJustificationText } from '../../utils/AutofillUtils';

const QuestionRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  border-bottom: ${(props) => (props.highlight ? 'none' : `solid 1px ${OL.GREY11} !important`)};
  border: ${(props) => (props.highlight ? `solid 1px ${OL.PURPLE14}` : 'none')};
`;

const PaddedExpandableText = styled(ExpandableText)`
  margin: 5px 0 10px 0;
`;

const Number = styled.div`
  display: flex;
  align-items: center;
`;

const RequiredFieldWarning = styled.section`
  color: ${OL.PURPLE14};
  display: flex;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  align-items: center;

  svg {
    padding: 0 5px 0 10px;
  }
`;

const QuestionLabels = styled.div`
  display: flex;

  div {
    color: ${OL.GREY01};
    font-family: 'Open Sans', sans-serif;
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

const Prompt = styled.div`
  color: ${OL.GREY01};
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  padding-right: 20px;

  div {
    width: 100% !important;
  }
`;

const PromptNotesWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;

  ${Prompt} {
    width: 50%;
  }

  input {
    width: 50%;
  }

  div {
    width: 50%;
  }
`;

const InlineFormGroup = styled.div`
  display: flex;
  margin-bottom: 30px;

  label {
    margin-right: 10px;
  }
`;

const Justifications = styled.div`
  width: 100%;

  h1 {
    color: ${OL.GREY01};
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 5px;
    text-transform: uppercase;
  }

  div {
    color: ${OL.GREY02};
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
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
                  <FontAwesomeIcon icon={faExclamationCircle} color={OL.PURPLE14} size="2x" />
                  Required
                </RequiredFieldWarning>
              ) : null
          }
        </Number>
        <div>Notes</div>
      </QuestionLabels>
      <PromptNotesWrapper>
        <Prompt>{ prompt }</Prompt>
        {
          viewOnly && notesValue
            ? (
              <PaddedExpandableText text={notesValue} maxLength={250} />
            )
            : (
              <StyledInput
                  disabled={viewOnly}
                  name={NOTES[field]}
                  onChange={handleInputChange}
                  value={notesValue} />
            )
        }
      </PromptNotesWrapper>
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
