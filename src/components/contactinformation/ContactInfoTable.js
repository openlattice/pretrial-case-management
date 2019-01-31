/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import { Map } from 'immutable';

import ContactInfoRow from './ContactInfoRow';
import { NoResults } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const Table = styled.table`
  max-height: 70vh !important;
  border: 1px solid ${OL.GREY08};
  margin-bottom: 30px;
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

  renderHeaders = () => (
    <HeaderRow>
      <HeaderElement>Contact</HeaderElement>
      <HeaderElement>Type</HeaderElement>
      <HeaderElement>Mobile</HeaderElement>
      <HeaderElement>Preferred</HeaderElement>
    </HeaderRow>
  );

  render() {
    const {
      contactInfo,
      disabled,
      editing,
      hasPermission,
      noResults,
      handleCheckboxUpdates
    } = this.props;
    if (noResults) return <NoResults>No contact information on file.</NoResults>;
    let chargeSeq = editing
      ? contactInfo.valueSeq()
      : contactInfo.valueSeq()
        .filter(contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], ''));
    chargeSeq = chargeSeq
      .sortBy((contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PHONE, 0], '')))
      .sortBy((contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.EMAIL, 0], '')))
      .sortBy((contact => !contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], '')))
      .map((contact => (
        <ContactInfoRow
            disabled={disabled}
            key={contact.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '')}
            handleCheckboxUpdates={handleCheckboxUpdates}
            hasPermission={hasPermission}
            contact={contact.get(PSA_NEIGHBOR.DETAILS, Map())}
            editing={editing} />
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
