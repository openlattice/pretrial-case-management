/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';

import ChargeRow from './ChargeRow';
import { NoResults } from '../../utils/Layout';
import { CHARGE_TYPES, CHARGE_HEADERS } from '../../utils/consts/ChargeConsts';
import { OL } from '../../utils/consts/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const Table = styled.table`
  width: 100%;
  min-width: 960px;
  max-height: 70vh !important;
  border: 1px solid ${OL.GREY08};
  margin-bottom: 10px;
`;

const HeaderRow = styled.tr`
  background-color: ${OL.GREY08};
  border: 1px solid ${OL.GREY08};
`;

const HeaderElement = styled.th`
  font-size: 12px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY02};
  text-transform: uppercase;
  padding: 10px 5px;
`;

const CenteredHeaderElement = styled(HeaderElement)`
  text-align: center;
`;

class ChargeTable extends React.Component<Props, State> {
  renderHeaders = () => {
    const { chargeType } = this.props;
    let headers;
    if (chargeType === CHARGE_TYPES.ARREST) {
      headers = (
        <HeaderRow>
          <th aria-label="blank" />
          <HeaderElement>{CHARGE_HEADERS.STATUTE}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DESCRIPTION}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DEGREE}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DEGREE_SHORT}</HeaderElement>
          <CenteredHeaderElement>{CHARGE_HEADERS.VIOLENT}</CenteredHeaderElement>
          <CenteredHeaderElement>{CHARGE_HEADERS.STEP_2}</CenteredHeaderElement>
          <CenteredHeaderElement>{CHARGE_HEADERS.STEP_4}</CenteredHeaderElement>
          <CenteredHeaderElement>{CHARGE_HEADERS.BHE}</CenteredHeaderElement>
          <CenteredHeaderElement>{CHARGE_HEADERS.BRE}</CenteredHeaderElement>
        </HeaderRow>
      );
    }
    else if (chargeType === CHARGE_TYPES.COURT) {
      headers = (
        <HeaderRow>
          <th aria-label="blank" />
          <HeaderElement>{CHARGE_HEADERS.STATUTE}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DESCRIPTION}</HeaderElement>
          <CenteredHeaderElement>{CHARGE_HEADERS.VIOLENT}</CenteredHeaderElement>
        </HeaderRow>
      );
    }
    return headers;
  }

  render() {
    const {
      charges,
      chargeType,
      disabled,
      hasPermission,
      noResults
    } = this.props;
    if (noResults) return <NoResults>No Results</NoResults>;
    const chargeSeq = charges.valueSeq().map(((charge) => (
      <ChargeRow
          key={charge.getIn([OPENLATTICE_ID_FQN, 0], '')}
          hasPermission={hasPermission}
          charge={charge}
          chargeType={chargeType}
          disabled={disabled} />
    )));
    return (
      <Table>
        <tbody>
          { this.renderHeaders() }
          { chargeSeq }
        </tbody>
      </Table>
    );
  }
}

export default ChargeTable;
