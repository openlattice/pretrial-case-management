/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List } from 'immutable';
import { Tag } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDateTime } from '../../utils/FormattingUtils';
import {
  chargeIsMostSerious,
  chargeIsGuilty,
  historicalChargeIsViolent
} from '../../utils/HistoricalChargeUtils';

const {
  CHARGE_DEGREE,
  CHARGE_DESCRIPTION,
  CHARGE_STATUTE,
  DISPOSITION,
  DISPOSITION_DATE,
  ENTITY_KEY_ID,
  PLEA,
  PLEA_DATE
} = PROPERTY_TYPES;


const ChargeWrapper = styled.div`
  display: grid;
  font-size: 11px;
  grid-template-columns: repeat(4, auto);
  padding: 10px 30px;

  div {
    padding: 3px;
  }
`;

const Description = styled.div`
  text-transform: uppercase;
  ${(props) => (props.showDetails
    ? ''
    : `
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    `)}
`;

const DetailRow = styled.div`
  background: ${OL.GREY10};
  grid-column-end: 5;
  grid-column-start: 1;
`;

const Level = styled.div`
  text-transform: uppercase;
`;

const Statute = styled.div`
  font-weight: 600;
`;

const Tags = styled.div`
  display: flex;
  flex-direction: row;
`;

type Props = {
  caseNumber :string;
  charges :List;
  pretrialCase :Map;
  showDetails :boolean;
  violentChargeList :Map;
};

const CaseInformation = ({
  caseNumber,
  charges,
  pretrialCase,
  showDetails,
  violentChargeList
} :Props) => (
  <ChargeWrapper key={caseNumber}>
    {
      charges.map((charge) => {
        const {
          [CHARGE_DEGREE]: chargeDegree,
          [CHARGE_DESCRIPTION]: chargeDescription,
          [CHARGE_STATUTE]: chargeStatute,
          [DISPOSITION]: disposition,
          [DISPOSITION_DATE]: dispositionDate,
          [ENTITY_KEY_ID]: chargeEKID,
          [PLEA]: plea,
          [PLEA_DATE]: pleaDate
        } = getEntityProperties(charge, [
          CHARGE_DEGREE,
          CHARGE_DESCRIPTION,
          CHARGE_STATUTE,
          DISPOSITION,
          DISPOSITION_DATE,
          ENTITY_KEY_ID,
          PLEA,
          PLEA_DATE
        ]);
        const pleaString = `Plea: ${formatDateTime(pleaDate)} — ${plea}`;
        const dispositionString = `Disposition: ${formatDateTime(dispositionDate)} — ${disposition}`;
        const convicted :boolean = chargeIsGuilty(charge);
        const mostSerious :boolean = chargeIsMostSerious(charge, pretrialCase);
        const violent :boolean = historicalChargeIsViolent({
          charge,
          violentChargeList
        });

        const tags = (
          <Tags key={`${chargeEKID}-tags`}>
            { (mostSerious) ? <Tag mode="nuetral">MS</Tag> : null }
            { (violent) ? <Tag mode="danger">V</Tag> : null }
            { (convicted) ? <Tag>C</Tag> : null }
          </Tags>
        );

        return (
          <>
            <Statute key={`${chargeEKID}-Statute`}>{chargeStatute}</Statute>
            <Description showDetails={showDetails} key={`${chargeEKID}-Description`}>{chargeDescription}</Description>
            <Level key={`${chargeEKID}-Level`}>{chargeDegree}</Level>
            { tags }
            {
              showDetails
                ? (
                  <>
                    <DetailRow key={`${chargeEKID}-pleaString`}>{pleaString}</DetailRow>
                    <DetailRow key={`${chargeEKID}-dispositionString`}>{dispositionString}</DetailRow>
                  </>
                ) : null
            }
          </>
        );
      })
    }
  </ChargeWrapper>
);

export default CaseInformation;
