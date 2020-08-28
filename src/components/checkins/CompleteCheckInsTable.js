/*
 * @flow
 */

import React from 'react';
import { List } from 'immutable';
import { Table } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSlash } from '@fortawesome/pro-light-svg-icons';

import { OL } from '../../utils/consts/Colors';
import { StyledCard, TableHeader, IconContainer } from './CheckInsStyledTags';

type Props = {
  completeCheckInAppointments :List<*>,
  loading :boolean
};

const HEADERS :Object[] = [
  { key: 'checkInTime', label: 'Time', cellStyle: { 'padding-left': '30px', color: OL.GREY02 } },
  { key: 'personName', label: 'Name', cellStyle: { color: OL.GREY02 } },
  { key: 'checkInNumber', label: 'Number', cellStyle: { color: OL.GREY02 } },
  { key: 'type', label: 'Type', cellStyle: { color: OL.GREY02 } },
  { key: 'numAttempts', label: '# Attempts', cellStyle: { color: OL.GREY02 } }
];

const CompleteCheckInsTable = ({
  completeCheckInAppointments,
  loading
} :Props) => {
  const paginationOptions :number[] = completeCheckInAppointments.size > 5 ? [5, 10, 20] : [];

  return (
    <StyledCard vertical noPadding>
      <TableHeader>Complete</TableHeader>
      {
        !completeCheckInAppointments.size
          ? (
            <IconContainer>
              <FontAwesomeIcon size="4x" icon={faUserSlash} />
              No Complete Check-Ins
            </IconContainer>
          )
          : (
            <Table
                isLoading={loading}
                headers={HEADERS}
                data={completeCheckInAppointments}
                rowsPerPageOptions={paginationOptions}
                paginated={!!paginationOptions.length} />
          )
      }
    </StyledCard>
  );
};

export default CompleteCheckInsTable;
