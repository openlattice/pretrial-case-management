/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ContentBlock from '../ContentBlock';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { HEADER_LABELS } from '../../utils/consts/DMFResultConsts';
import {
  BOND_TYPES,
  CONDITION_LIST,
  OUTCOMES,
  RELEASES
} from '../../utils/consts/ReleaseConditionConsts';

const { HELD, RELEASED } = RELEASES;

const SummaryWrapper = styled.div`
  margin: 30px;
  padding: 20px;
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
`;
const HearingItems = styled.div`
  padding: 10px 0px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 20px;
`;

const OutcomeItems = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 20px;
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  width: 100%;
  min-width: 84px;
  height: 56px;
  border-radius: 3px;
  background-color: ${OL.GREY05};
  color: ${OL.GREY02};
  font-family: 'Open Sans',sans-serif;
  font-size: 13.5px;
  font-weight: normal;
  margin-top: 10px;
`;

const Headers = styled.div`
  display: grid;
  grid-template-columns: 10% 35% 25%;
  grid-gap: 20px;
  font-family: 'Open Sans',sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  color: ${OL.GREY02};
  font-size: 11px;
}
`;
const Row = styled.div`
  font-family: 'Open Sans',sans-serif;
  font-weight: normal;
  color: ${OL.GREY15};
  font-size: 14px;
  display: grid;
  grid-template-columns: 10% 35% 25%;
  grid-gap: 20px;
  padding: 10px 0;
  border-top: 1px solid ${OL.GREY05};
`;

const RowItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const CondtionList = styled.div`
  margin-top: 30px;
  list-style: none;
`;

type Props = {
  hearing :Object;
}

const HearingSummary = ({ hearing } :Props) => {
  const {
    date,
    time,
    courtroom,
    judge,
    hearingOutcome,
    hearingBond,
    hearingConditions,
    component
  } = hearing;
  let bondType;
  let bondAmount;
  let decision = HELD;

  const coreOutcomes = Object.values(OUTCOMES);
  const reccomendation = HEADER_LABELS[hearingOutcome.getIn([PROPERTY_TYPES.RELEASE_TYPE, 0])];
  const outcome = hearingOutcome.getIn([PROPERTY_TYPES.OUTCOME, 0]);
  if (hearingBond) {
    bondType = hearingBond.getIn([PROPERTY_TYPES.BOND_TYPE, 0]);
    if (bondType === BOND_TYPES.CASH_ONLY || bondType === BOND_TYPES.CASH_SURETY) {
      bondAmount = hearingBond.getIn([PROPERTY_TYPES.BOND_AMOUNT, 0]);
    }
    decision = RELEASED;
  }

  if (!coreOutcomes.includes(outcome)) decision = 'N/A';

  let conditionsByType = Immutable.Map();
  if (hearingConditions) {
    hearingConditions.forEach((condition) => {
      const type = condition.getIn(
        [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.TYPE, 0],
        condition.getIn([PROPERTY_TYPES.TYPE, 0]) // check for old data
      );
      conditionsByType = conditionsByType.set(type, conditionsByType.get(type, Immutable.List()).push(
        condition.get(PSA_NEIGHBOR.DETAILS, (condition || Immutable.Map())) // check for old data
      ));
    });
  }

  const c247Types = conditionsByType.get(CONDITION_LIST.C_247, Immutable.List()).map((condition) => {
    const planType = condition.getIn(
      [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PLAN_TYPE, 0],
      condition.getIn([PROPERTY_TYPES.PLAN_TYPE, 0]) // check for old data
    );
    const frequency = condition.getIn(
      [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.FREQUENCY, 0],
      condition.getIn([PROPERTY_TYPES.FREQUENCY, 0]) // check for old data
    );
    return frequency ? `${planType} ${frequency}` : planType;
  });

  const noContactPeople = conditionsByType.get(CONDITION_LIST.NO_CONTACT, Immutable.List()).map((condition) => {
    const personType = condition.getIn(
      [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_TYPE, 0],
      condition.getIn([PROPERTY_TYPES.PERSON_TYPE, 0]) // check for old data
    );
    const personName = condition.getIn(
      [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_NAME, 0],
      condition.getIn([PROPERTY_TYPES.PERSON_NAME, 0]) // check for old data
    );
    return {
      [PROPERTY_TYPES.PERSON_TYPE]: personType,
      [PROPERTY_TYPES.PERSON_NAME]: personName
    };
  });

  const listItems = Object.keys(conditionsByType.toJS()).map((condition) => {
    let listItem;
    const startDate = conditionsByType.getIn([condition, 0, PROPERTY_TYPES.START_DATE], '');
    if (condition === CONDITION_LIST.NO_CONTACT) {
      listItem = (
        <li key={condition}>
          <Row>
            <RowItem>{startDate}</RowItem>
            <RowItem>{condition}</RowItem>
            <RowItem>
              { noContactPeople.map((person) => (
                <RowItem key={`${person[PROPERTY_TYPES.PERSON_TYPE]} - ${person[PROPERTY_TYPES.PERSON_NAME]}`}>
                  {`${person[PROPERTY_TYPES.PERSON_TYPE]} - ${person[PROPERTY_TYPES.PERSON_NAME]}`}
                </RowItem>
              ))}
            </RowItem>
          </Row>
        </li>
      );
    }
    else if (condition === CONDITION_LIST.CHECKINS) {
      const frequency = conditionsByType.getIn([condition, 0, PROPERTY_TYPES.FREQUENCY], '');
      listItem = (
        <li key={condition}>
          <Row>
            <RowItem>{startDate}</RowItem>
            <RowItem>{condition}</RowItem>
            <RowItem>{frequency}</RowItem>
          </Row>
        </li>
      );
    }
    else if (condition === CONDITION_LIST.C_247) {
      listItem = (
        <li key={condition}>
          <Row>
            <RowItem>{startDate}</RowItem>
            <RowItem>{condition}</RowItem>
            <RowItem>
              { c247Types.map((Type) => (
                <RowItem key={Type}>{Type}</RowItem>
              ))}
            </RowItem>
          </Row>
        </li>
      );
    }
    else if (condition === CONDITION_LIST.OTHER) {
      const otherText = conditionsByType.getIn([condition, 0, PROPERTY_TYPES.OTHER_TEXT], '');
      listItem = (
        <li key={condition}>
          <Row>
            <RowItem>{startDate}</RowItem>
            <RowItem>{condition}</RowItem>
            <RowItem>{otherText}</RowItem>
          </Row>
        </li>
      );
    }
    else {
      listItem = (
        <li key={condition}>
          <Row>
            <RowItem>{startDate}</RowItem>
            <RowItem>{condition}</RowItem>
          </Row>
        </li>
      );
    }
    return listItem;
  });

  const hearingDetails = [
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
      content: [judge]
    }
  ];

  let outcomeDetails = [
    {
      label: 'Recommendation',
      content: [(<ContentBox>{reccomendation}</ContentBox>)]
    },
    {
      label: 'Outcome',
      content: [(<ContentBox>{outcome}</ContentBox>)]
    },
    {
      label: 'Decision',
      content: [(<ContentBox>{decision}</ContentBox>)]
    }
  ];

  if (bondType) {
    outcomeDetails = outcomeDetails.concat(
      [
        {
          label: 'Bond Type',
          content: [(<ContentBox>{bondType}</ContentBox>)]
        }
      ]
    );
  }

  if (bondAmount) {
    outcomeDetails = outcomeDetails.concat(
      [
        {
          label: 'Bond Amount',
          content: [(<ContentBox>{`$${bondAmount}`}</ContentBox>)]
        }
      ]
    );
  }

  const hearingContent = hearingDetails.map((item) => (
    <ContentBlock
        component={component}
        contentBlock={item}
        key={`${item.label}`} />
  ));
  const outcomeContent = outcomeDetails.map((item) => (
    <ContentBlock
        component={component}
        contentBlock={item}
        key={`${item.label}`} />
  ));

  return (
    <SummaryWrapper key={`${date}-${time}`}>
      <HearingItems>
        {hearingContent}
      </HearingItems>
      <OutcomeItems>
        {outcomeContent}
      </OutcomeItems>
      { hearingConditions
        ? (
          <CondtionList>
            <Headers>
              <RowItem>Start Date</RowItem>
              <RowItem>Condition</RowItem>
              <RowItem>Type</RowItem>
            </Headers>
            {listItems}
          </CondtionList>
        )
        : null}
    </SummaryWrapper>
  );

};

export default HearingSummary;
