/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import { Map } from 'immutable';

import SelectContactInfoRow from './SelectContactInfoRow';
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

const NoResultsForTable = styled(NoResults)`
  padding-top: 20px;
`;

class ChargeTable extends React.Component<Props, State> {

  renderHeaders = () => (
    <HeaderRow>
      <HeaderElement>Contact</HeaderElement>
      <HeaderElement>Type</HeaderElement>
      <HeaderElement>Mobile</HeaderElement>
      <HeaderElement>Preferred</HeaderElement>
      <HeaderElement>Select</HeaderElement>
    </HeaderRow>
  );

  render() {
    const {
      contactInfo,
      onCheckBoxChange,
      selectedContactEntityKeyId,
      noResults
    } = this.props;
    const contactList = contactInfo
      .sortBy((contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PHONE, 0], '')))
      .sortBy((contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.EMAIL, 0], '')))
      .sortBy((contact => !contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false)))
      .map((contact => (
        <SelectContactInfoRow
            key={contact.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '')}
            onCheckBoxChange={onCheckBoxChange}
            contact={contact.get(PSA_NEIGHBOR.DETAILS, Map())}
            selectedContactEntityKeyId={selectedContactEntityKeyId} />
      )));
    return (
      <>
        <Table>
          <tbody>
            { this.renderHeaders() }
            { noResults ? null : contactList }
          </tbody>
        </Table>
        {
          noResults
            ? <NoResultsForTable>No contact information on file.</NoResultsForTable>
            : null
        }
      </>
    );
  }
}

export default ChargeTable;
