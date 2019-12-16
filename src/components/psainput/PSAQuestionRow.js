/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import type { Element } from 'react';

import PSARadioButton from './PSARadioButton';
import ExpandableText from '../controls/ExpandableText';
import StyledInput from '../controls/StyledInput';

import { OL } from '../../utils/consts/Colors';
import { NOTES } from '../../utils/consts/Consts';
import { getJustificationText } from '../../utils/AutofillUtils';

const QuestionRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  border-bottom: solid 1px ${OL.GREY11} !important;
`;

const PaddedExpandableText = styled(ExpandableText)`
  margin: 5px 0 10px 0;
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
  mappings :Object;
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
  mappings,
  num,
  prompt,
  viewOnly,
} :Props) => {

  // Only render autojustification if app settings loads historical charges
  const rowNumFormatted :string = num < 10 ? `0${num}` : `${num}`;
  const notesValue :string = input.get(NOTES[field]);
  const justificationText :string = getJustificationText(justifications, justificationHeader);

  return (
    <QuestionRow>
      <QuestionLabels>
        <div>{ rowNumFormatted }</div>
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
          Object.keys(mappings)
            .map((value :string) => (
              <PSARadioButton
                  key={`${field}-${value}`}
                  disabledField={disabledField}
                  handleInputChange={handleInputChange}
                  input={input}
                  label={mappings[value]}
                  name={field}
                  value={value}
                  viewOnly={viewOnly} />
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
