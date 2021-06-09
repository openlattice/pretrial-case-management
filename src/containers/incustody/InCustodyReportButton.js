/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { RequestState } from 'redux-reqseq';
import { Button } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Map, Set } from 'immutable';
import { ReduxUtils } from 'lattice-utils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleDown } from '@fortawesome/pro-light-svg-icons';
import downloadInCustodyReport from '../../utils/downloads/InCustodyReport';

import { LOAD_PSAS_BY_STATUS, LOAD_PSA_DATA } from '../review/ReviewActions';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import REVIEW_DATA from '../../utils/consts/redux/ReviewConsts';
import { IN_CUSTODY_ACTIONS, IN_CUSTODY_DATA } from '../../utils/consts/redux/InCustodyConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';

const { isPending } = ReduxUtils;

const ButtonWrapper = styled.div`
  width: 100%;
  margin-top: 30px;
  text-align: center;
`;

type Props = {
  downloadInCustodyReportReqState :RequestState;
  getInCustodyDataRequestState :RequestState;
  getPeopleNeighborsReqState :RequestState;
  jailStaysById :Map;
  jailStayNeighborsById :Map;
  loadingResults :boolean;
  peopleInCustody :Set;
  peopleNeighborsById :Map;
  psaNeighborsById :Map;
};

class InCustodyDownloadButton extends React.Component<Props, *> {

  isDisabled = () => {
    const {
      downloadInCustodyReportReqState,
      getInCustodyDataRequestState,
      getPeopleNeighborsReqState,
      loadingResults,
      peopleInCustody
    } = this.props;
    return loadingResults
      || isPending(downloadInCustodyReportReqState)
      || isPending(getInCustodyDataRequestState)
      || isPending(getPeopleNeighborsReqState)
      || !peopleInCustody.size;
  }

  downloadReport = () => {
    const {
      jailStaysById,
      jailStayNeighborsById,
      peopleNeighborsById,
      psaNeighborsById
    } = this.props;
    downloadInCustodyReport({
      jailStaysById,
      jailStayNeighborsById,
      peopleNeighborsById,
      psaNeighborsById
    });
  }

  render() {
    const icon = <FontAwesomeIcon icon={faArrowAltCircleDown} />;
    return (
      <ButtonWrapper>
        <Button startIcon={icon} onClick={this.downloadReport} disabled={this.isDisabled()}>
          Download In-Custody Report
        </Button>
      </ButtonWrapper>
    );
  }

}

function mapStateToProps(state) {
  const inCustody = state.get(STATE.IN_CUSTODY, Map());
  const review = state.get(STATE.REVIEW, Map());
  const people = state.get(STATE.PEOPLE, Map());
  const loadPSAsByStatusRS = getReqState(review, LOAD_PSAS_BY_STATUS);
  const loadPSADataRS = getReqState(review, LOAD_PSA_DATA);
  const loadingPSAsByStatus = isPending(loadPSAsByStatusRS);
  const loadingPSAData = isPending(loadPSADataRS);
  const loadingResults = loadingPSAsByStatus || loadingPSAData;
  return {
    // In-Custody
    downloadInCustodyReportReqState: getReqState(inCustody, IN_CUSTODY_ACTIONS.DOWNLOAD_IN_CUSTODY_REPORT),
    getInCustodyDataRequestState: getReqState(inCustody, IN_CUSTODY_ACTIONS.GET_IN_CUSTODY_DATA),
    [IN_CUSTODY_DATA.JAIL_STAYS_BY_ID]: inCustody.get(IN_CUSTODY_DATA.JAIL_STAYS_BY_ID),
    [IN_CUSTODY_DATA.JAIL_STAY_NEIGHBORS_BY_ID]: inCustody.get(IN_CUSTODY_DATA.JAIL_STAY_NEIGHBORS_BY_ID),
    [IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY]: inCustody.get(IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY),

    // Review
    [REVIEW_DATA.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW_DATA.PSA_NEIGHBORS_BY_ID),
    loadingResults,

    // People
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID),
  };
}

// $FlowFixMe
export default connect(mapStateToProps, null)(InCustodyDownloadButton);
