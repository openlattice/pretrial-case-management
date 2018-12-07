/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';

import ChargeRow from './ChargeRow';
import { CHARGE_TYPES, CHARGE_HEADERS } from '../../utils/consts/ChargeConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const Table = styled.table`
width: 100%;
min-width: 960px;
max-height: 70vh !important;
border: 1px solid ${OL.GREY08};
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
  text-align: center;
  padding: 10px;
`;

class ChargeTable extends React.Component<Props, *> {

  renderHeaders = () => {
    const { chargeType } = this.props;
    let headers;
    if (chargeType === CHARGE_TYPES.ARREST) {
      headers = (
        <HeaderRow>
          <HeaderElement>{CHARGE_HEADERS.STATUTE}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DESCRIPTION}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DEGREE}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DEGREE_SHORT}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.VIOLENT}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.STEP_2}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.STEP_4}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.BHE}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.BRE}</HeaderElement>
        </HeaderRow>
      );
    }
    else if (chargeType === CHARGE_TYPES.COURT) {
      headers = (
        <HeaderRow>
          <HeaderElement>{CHARGE_HEADERS.STATUTE}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.DESCRIPTION}</HeaderElement>
          <HeaderElement>{CHARGE_HEADERS.VIOLENT}</HeaderElement>
        </HeaderRow>
      );
    }
    return headers;
  }

  render() {
    let { charges } = this.props;
    const { chargeType, disabled } = this.props;
    charges = charges
      .sortBy(charge => charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], ''))
      .sortBy(charge => charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], ''));
    return (
      <Table>
        <tbody>
          { this.renderHeaders() }
          {charges.map((charge => (
            <ChargeRow
                key={charge.getIn([OPENLATTICE_ID_FQN, 0], '')}
                charge={charge}
                chargeType={chargeType}
                disabled={disabled} />
          )))}
        </tbody>
      </Table>
    );
  }
}

export default ChargeTable;
