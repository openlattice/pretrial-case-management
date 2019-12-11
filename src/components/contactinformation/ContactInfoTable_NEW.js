/*
 * @flow
 */
import React, { Component } from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import { Table } from 'lattice-ui-kit';
import { List, Map } from 'immutable';

import ContactInfoRow from './ContactInfoRow_NEW';
import { NoResults } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { getEntityKeyId } from '../../utils/DataUtils';

const { OPENLATTICE_ID_FQN } = Constants;
const cellStyle :Object = {
  backgroundColor: OL.GREY08,
  color: OL.GREY39,
  fontSize: '11px',
  fontWeight: 'normal',
  padding: '12px 0 12px 30px',
  textAlign: 'left',
};
const TABLE_HEADER_NAMES :string[] = ['CONTACT INFORMATION', 'TAGS'];
const TABLE_HEADERS :Object[] = TABLE_HEADER_NAMES.map((name :string) => ({
  cellStyle,
  key: name,
  label: name,
  sortable: false,
}));

type Props = {
  contactInfo :List;
  disabled :boolean;
  editing :boolean;
  hasPermission :boolean;
  loading :boolean;
  noResults :boolean;
  handleCheckboxUpdates :() => void;
};

class ContactInfoTable extends Component<Props> {

  aggregateContactTableData = () => {
    const { contactInfo, editing } = this.props;
    let contactList = editing
      ? contactInfo
      : contactInfo
        .filter(contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false));
    contactList = contactList
      .sortBy((contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PHONE, 0], '')))
      .sortBy((contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.EMAIL, 0], '')))
      .sortBy((contact => !contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false)))
      .map((contact :Map) => {
        const contactMethod = contact.hasIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PHONE, 0])
          ? contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PHONE, 0], '')
          : contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.EMAIL, 0], '');
        return {
          [TABLE_HEADER_NAMES[0]]: contactMethod,
          [TABLE_HEADER_NAMES[1]]: '',
          id: getEntityKeyId(contact),
        };
      })
      .toJS();
    console.log('contactList: ', contactList);
    return contactList;
  }

  render() {
    const {
      contactInfo,
      disabled,
      editing,
      hasPermission,
      loading,
      noResults,
      handleCheckboxUpdates
    } = this.props;

    const contactList :Object[] = this.aggregateContactTableData();
    const hasContactButNoPreferred = (!noResults && contactList.length === 0);
    return (
      <>
        <Table
            components={{ Row: ContactInfoRow }}
            data={contactList}
            headers={TABLE_HEADERS}
            isLoading={loading} />
        {
          hasContactButNoPreferred
            ? <NoResults>Existing contact info must be mark preferred.</NoResults>
            : null
        }
        {
          noResults
            ? <NoResults>No contact information on file.</NoResults>
            : null
        }
      </>
    );
  }
}

export default ContactInfoTable;
