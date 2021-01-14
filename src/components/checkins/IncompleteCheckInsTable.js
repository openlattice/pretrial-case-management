import React from 'react';
import { DateTime } from 'luxon';
import { List } from 'immutable';
import { Table } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-light-svg-icons';

import IncompleteCheckInRow from './IncompleteCheckInRow';
import { OL } from '../../utils/consts/Colors';
import { StyledCard, TableHeader, IconContainer } from './CheckInsStyledTags';

type Props = {
  checkInsDate :DateTime,
  incompleteCheckInAppointments :List<*>,
  loading :boolean,
  openManualCheckInModal :() => void
};

const HEADERS :Object[] = [
  { key: 'person', label: 'Name', cellStyle: { 'padding-left': '30px', color: OL.GREY02 } },
  { key: 'checkInNumber', label: 'Number', cellStyle: { color: OL.GREY02 } },
  { key: 'type', label: 'Type', cellStyle: { color: OL.GREY02 } },
  { sortable: false, cellStyle: { color: OL.GREY02 } }
];

const IncompleteCheckInsTable = ({
  checkInsDate,
  incompleteCheckInAppointments,
  openManualCheckInModal,
  loading
} :Props) => {
  const pendingAreOverdue :boolean = checkInsDate < DateTime.local();
  const paginationOptions :number[] = incompleteCheckInAppointments.size > 5 ? [5, 10, 20] : [];
  const HeaderText :string = pendingAreOverdue ? 'Overdue' : 'Pending';

  const components :Object = {
    Row: ({ data } :any) => (
      <IncompleteCheckInRow
          openManualCheckInModal={openManualCheckInModal}
          pendingAreOverdue={pendingAreOverdue}
          levels={openManualCheckInModal}
          data={data} />
    )
  };

  return (
    <StyledCard vertical noPadding>
      <TableHeader>{HeaderText}</TableHeader>
      {
        !incompleteCheckInAppointments.size
          ? (
            <IconContainer>
              <FontAwesomeIcon size="4x" icon={faCheckCircle} />
              {`No ${HeaderText} Check-Ins`}
            </IconContainer>
          )
          : (
            <Table
                isLoading={loading}
                components={components}
                headers={HEADERS}
                data={incompleteCheckInAppointments}
                rowsPerPageOptions={paginationOptions}
                paginated={!!paginationOptions.length} />
          )
      }
    </StyledCard>
  );
};

export default IncompleteCheckInsTable;
