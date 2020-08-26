/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { RequestState } from 'redux-reqseq';
import { Button } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Map, Set } from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleDown } from '@fortawesome/pro-light-svg-icons';
import downloadInCustodyReport from '../../utils/downloads/InCustodyReport';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { REVIEW } from '../../utils/consts/FrontEndStateConsts';
import { IN_CUSTODY_ACTIONS, IN_CUSTODY_DATA } from '../../utils/consts/redux/InCustodyConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

const ButtonWrapper = styled.div`
  width: 100%;
  margin-top: 30px;
  text-align: center;
`;

type Props = {
  downloadInCustodyReportReqState :RequestState;
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
      getPeopleNeighborsReqState,
      loadingResults,
      peopleInCustody
    } = this.props;
    return loadingResults
      || requestIsPending(downloadInCustodyReportReqState)
      || requestIsPending(getPeopleNeighborsReqState)
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
  return {
    // In-Custody
    downloadInCustodyReportReqState: getReqState(inCustody, IN_CUSTODY_ACTIONS.DOWNLOAD_IN_CUSTODY_REPORT),
    [IN_CUSTODY_DATA.JAIL_STAYS_BY_ID]: inCustody.get(IN_CUSTODY_DATA.JAIL_STAYS_BY_ID),
    [IN_CUSTODY_DATA.JAIL_STAY_NEIGHBORS_BY_ID]: inCustody.get(IN_CUSTODY_DATA.JAIL_STAY_NEIGHBORS_BY_ID),
    [IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY]: inCustody.get(IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY),

    // Review
    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS) || review.get(REVIEW.LOADING_DATA),

    // People
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID),
  };
}

export default connect(mapStateToProps, null)(InCustodyDownloadButton);
