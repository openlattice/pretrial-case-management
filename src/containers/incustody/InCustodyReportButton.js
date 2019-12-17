/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { IconButton } from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleDown } from '@fortawesome/pro-light-svg-icons';


import { STATE } from '../../utils/consts/redux/SharedConsts';
import { REVIEW } from '../../utils/consts/FrontEndStateConsts';
import { IN_CUSTODY_ACTIONS, IN_CUSTODY_DATA } from '../../utils/consts/redux/InCustodyConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { downloadInCustodyReport } from './InCustodyActions';

const ButtonWrapper = styled.div`
  width: 100%;
  margin-top: 30px;
  text-align: center;
`;

type Props = {
  downloadInCustodyReportReqState :RequestState,
  getPeopleNeighborsReqState :RequestState,
  loadingResults :boolean,
  peopleInCustody :Set,
  actions :{
    downloadInCustodyReport :RequestSequence
  },
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
      actions,
      peopleNeighborsById,
      psaNeighborsById
    } = this.props;
    actions.downloadInCustodyReport({
      peopleNeighborsById,
      psaNeighborsById
    });
  }

  render() {
    const icon = <FontAwesomeIcon icon={faArrowAltCircleDown} />;
    return (
      <ButtonWrapper>
        <IconButton icon={icon} onClick={this.downloadReport} disabled={this.isDisabled()}>
          Download In-Custody Report
        </IconButton>
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
    [IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY]: inCustody.get(IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY),

    // Review
    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS) || review.get(REVIEW.LOADING_DATA),

    // People
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID),
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // In-Custody Actions
    downloadInCustodyReport
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(InCustodyDownloadButton);
