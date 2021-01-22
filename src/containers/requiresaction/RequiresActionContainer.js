/*
 * @flow
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { fromJS } from 'immutable';
import { ReduxUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Label,
  PaginationToolbar,
  SearchResults,
  Select
} from 'lattice-ui-kit';

import SearchResult from './components/SearchResult';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { STATUS_OPTIONS } from '../../utils/consts/ReviewPSAConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import {
  LOAD_REQUIRES_ACTION,
  loadRequiresAction,
  setValue
} from './actions';

import {
  HITS,
  PAGE,
  REQUEST_STATE,
  TOTAL_HITS,
} from '../../core/redux/constants';
import REQUIRES_ACTION_DATA from '../../utils/consts/redux/RequiresAction';

const FilterRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px 30px;

  label {
    white-space: nowrap;
    margin: 10px;
  }
`;

const { REQUIRES_ACTION } = STATE;
const { isStandby, isPending, isSuccess } = ReduxUtils;

const PAGE_SIZE = 20;

const LocationsContainer = () => {

  const dispatch = useDispatch();
  const selectedOrganizationId = useSelector((store) => store.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], ''));
  const hits = useSelector((store) => store.getIn([REQUIRES_ACTION, HITS], []));
  const page = useSelector((store) => store.getIn([REQUIRES_ACTION, PAGE], 1));
  const statusFilter = useSelector((store) => store.getIn([REQUIRES_ACTION, REQUIRES_ACTION_DATA.STATUS], '*'));
  const totalHits = useSelector((store) => store.getIn([REQUIRES_ACTION, TOTAL_HITS], 0));

  const loadRequiresActionRS = useSelector((store) => store
    .getIn([REQUIRES_ACTION, LOAD_REQUIRES_ACTION, REQUEST_STATE]));
  const requestIsStandby = isStandby(loadRequiresActionRS);
  const isLoading = isPending(loadRequiresActionRS);
  const requestIsSuccess = isSuccess(loadRequiresActionRS);

  useEffect(() => {
    if (selectedOrganizationId) {
      dispatch(loadRequiresAction({ statusFilter, start: page }));
    }
  }, [
    dispatch,
    page,
    selectedOrganizationId,
    statusFilter,
  ]);

  const onStatusChange = (status :Object) => {
    const { value } = status;
    dispatch(setValue({ field: REQUIRES_ACTION_DATA.STATUS, value }));
  };

  const onPageChange = ({ page: newPage }) => {
    dispatch(setValue({ field: PAGE, value: newPage }));
  };

  return (
    <div>
      <Card>
        <FilterRow>
          <Label>Status:</Label>
          <Select
              value={{ value: PSA_STATUSES.OPEN, label: 'Open' }}
              options={Object.values(STATUS_OPTIONS)}
              isLoading={isLoading}
              onChange={onStatusChange} />
        </FilterRow>
      </Card>
      <div>
        {
          requestIsSuccess
            && (
              <PaginationToolbar
                  page={page}
                  count={totalHits}
                  onPageChange={onPageChange}
                  rowsPerPage={PAGE_SIZE} />
            )
        }
        {
          hits.length > 0 && (
            <SearchResults
                hasSearched={!requestIsStandby}
                isLoading={isLoading}
                resultComponent={SearchResult}
                results={fromJS(hits)} />
          )
        }
        {
          requestIsSuccess
            && (
              <PaginationToolbar
                  page={page}
                  count={totalHits}
                  onPageChange={onPageChange}
                  rowsPerPage={PAGE_SIZE} />
            )
        }
      </div>
    </div>
  );
};

export default LocationsContainer;
