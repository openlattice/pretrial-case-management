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

const CondtionList = styled.div`
  list-style: none;
  margin-top: 30px;
`;

const ContentBox = styled.div`
  align-items: center;
  background-color: ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.GREY02};
  display: flex;
  flex-direction: column;
  font-family: 'Open Sans',sans-serif;
  font-size: 13.5px;
  font-weight: normal;
  height: 56px;
  justify-content: center;
  margin-top: 10px;
  min-width: 84px;
  padding: 10px 12px;
  text-align: center;
  width: 100%;
`;

const Headers = styled.div`
  color: ${OL.GREY02};
  display: grid;
  font-family: 'Open Sans',sans-serif;
  font-weight: 600;
  font-size: 11px;
  grid-template-columns: 10% 35% 25%;
  grid-gap: 20px;
  text-transform: uppercase;
`;

const HearingItems = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(5, 1fr);
  padding: 10px 0px;
`;

const OutcomeItems = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(5, 1fr);
`;

const Row = styled.div`
  border-top: 1px solid ${OL.GREY05};
  color: ${OL.GREY15};
  display: grid;
  font-family: 'Open Sans',sans-serif;
  font-weight: normal;
  font-size: 14px;
  grid-gap: 20px;
  grid-template-columns: 10% 35% 25%;
  padding: 10px 0;
`;

const RowItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryWrapper = styled.div`
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
  margin: 30px;
  padding: 20px;
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
