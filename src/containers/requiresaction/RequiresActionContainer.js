/*
 * @flow
 */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { DataUtils, ReduxUtils } from 'lattice-utils';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';
import { useDispatch, useSelector } from 'react-redux';
import {
  Colors,
  PaginationToolbar,
  SearchResults,
  Select
} from 'lattice-ui-kit';

import SearchResult from './components/SearchResult'
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { SORT_OPTIONS } from './constants';
import { STATUS_OPTIONS } from '../../utils/consts/ReviewPSAConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { getPeopleNeighbors } from '../people/PeopleActions';
import { loadPSAData } from '../review/ReviewActions';
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
  padding: 15px 30px 0 30px;
`;

const { REQUIRES_ACTION } = STATE;
const { isStandby, isPending, isSuccess } = ReduxUtils;

const PAGE_SIZE = 20;

const LocationsContainer = () => {

  const dispatch = useDispatch();
  const selectedOrganizationId = useSelector((store) => store.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], ""));
  const hits = useSelector((store) => store.getIn([REQUIRES_ACTION, HITS], []));
  const page = useSelector((store) => store.getIn([REQUIRES_ACTION, PAGE], 1));
  const sortByProperty = useSelector((store) => store.getIn([REQUIRES_ACTION, REQUIRES_ACTION_DATA.SORT], []));
  const statusFilter = useSelector((store) => store.getIn([REQUIRES_ACTION, REQUIRES_ACTION_DATA.STATUS], '*'));
  const totalHits = useSelector((store) => store.getIn([REQUIRES_ACTION, TOTAL_HITS], 0));

  const loadRequiresActionRS = useSelector((store) => store.getIn([REQUIRES_ACTION, LOAD_REQUIRES_ACTION, REQUEST_STATE]));
  const requestIsStandby = isStandby(loadRequiresActionRS);
  const isLoading = isPending(loadRequiresActionRS);
  const requestIsSuccess = isSuccess(loadRequiresActionRS);

  useEffect(() => {
    if (selectedOrganizationId) {
      dispatch(loadRequiresAction({ statusFilter, start: page, sortByProperty }));
    }
  }, [
    dispatch,
    page,
    selectedOrganizationId,
    sortByProperty,
    statusFilter,
  ]);

  const onSortChange = (sortByProperty :string) => {
    dispatch(setValue({ field: REQUIRES_ACTION_DATA.SORT, value: sortByProperty }));
  }

  const onStatusChange = (status :string) => {
    dispatch(setValue({ field: REQUIRES_ACTION_DATA.STATUS, value: status }));
  }

  const onPageChange = ({ page: newPage }) => {
    dispatch(setValue({ field: PAGE, value: newPage }));
  }

  return (
    <div>
      <FilterRow>
        <Select
            options={SORT_OPTIONS}
            isLoading={isLoading}
            onChange={onSortChange} />
        <Select
            options={STATUS_OPTIONS}
            isLoading={isLoading}
            onChange={onStatusChange} />
      </FilterRow>
      <div>
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
