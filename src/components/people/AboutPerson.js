/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Constants } from 'lattice';

import AboutPersonGeneral from '../person/AboutPersonGeneral';
import PSAReviewPersonRowList from '../../containers/review/PSAReviewReportsRowList';
import MultiSelectCheckbox from '../MultiSelectCheckbox';
import CaseHistory from '../casehistory/CaseHistory';
import CaseHistoryTimeline from '../casehistory/CaseHistoryTimeline';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES, PSA_STATUSES } from '../../utils/consts/Consts';
import { STATUS_OPTION_CHECKBOXES } from '../../utils/consts/ReviewPSAConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  Title,
  Count,
  AlternateSectionHeader
} from '../../utils/Layout';
import {
  getChargeHistory,
  getCaseHistory,
  getCasesForPSA
} from '../../utils/CaseUtils';
import { OL } from '../../utils/consts/Colors';

const { PSA_SCORES } = APP_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;

const Wrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  height: 100%;
`;

const StyledColumn = styled.div`
  width: 960px;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const StyledColumnRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
  max-width: 960px;
  background: ${OL.WHITE};
  border-radius: 5px;
`;

const StyledColumnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border-radius: 5px;
  background-color: ${OL.WHITE};
  border: solid 1px ${OL.GREY11};
`;

const StyledSectionHeader = styled(AlternateSectionHeader)`
  padding: 0;
`;

const CaseHistoryWrapper = styled.div`
  padding: 30px;
  width: 100%;
  overflow: hidden;
  hr {
    width: 100%;
    transform: translateX(-25%);
    width: 150%;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  z-index: 1;
  flex-direction: row;
  white-space: nowrap;
  width: 25%;
  position: absolute;
  transform: translateX(200px) translateY(50%);
`;

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  mostRecentPSA :Immutable.Map<*, *>,
  lastEditDateForPSA :string,
  arrestDate :string,
  loading :boolean
}

class AboutPerson extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      statusFilters: [
        PSA_STATUSES.OPEN,
        PSA_STATUSES.SUCCESS,
        PSA_STATUSES.FAILURE,
        PSA_STATUSES.DECLINED,
        PSA_STATUSES.DISMISSED
      ]
    };
  }

  handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const { statusFilters } = this.state;
    const values = statusFilters;

    if (checked && !values.includes(value)) {
      values.push(value);
    }
    if (!checked && values.includes(value)) {
      values.splice(values.indexOf(value), 1);
    }

    this.setState({ statusFilters: values });
  }

  renderHeaderSection = numResults => (
    <StyledSectionHeader>
      PSA History
      <Count>{numResults}</Count>
    </StyledSectionHeader>
  );

  renderStatusOptions = () => {
    const { statusFilters } = this.state;
    const statusOptions = Object.values(STATUS_OPTION_CHECKBOXES);
    return (
      <FilterWrapper>
        <MultiSelectCheckbox
            displayTitle="Filter Status"
            options={statusOptions}
            onChange={this.handleCheckboxChange}
            selected={statusFilters} />
      </FilterWrapper>
    );
  }

  renderPSAs = () => {
    const { neighbors, loading } = this.props;
    const { statusFilters } = this.state;
    const scoreSeq = neighbors.get(PSA_SCORES, Immutable.Map())
      .filter(neighbor => !!neighbor.get(PSA_NEIGHBOR.DETAILS)
        && statusFilters.includes(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0])))
      .map(neighbor => [
        neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]),
        neighbor.get(PSA_NEIGHBOR.DETAILS)
      ]);
    return (
      <PSAReviewPersonRowList
          loading={loading}
          scoreSeq={scoreSeq}
          sort={SORT_TYPES.DATE}
          renderContent={this.renderHeaderSection}
          component={CONTENT_CONSTS.PROFILE}
          hideCaseHistory
          hideProfile
          personProfile />
    );
  };

  renderCaseHistory = (
    caseHistoryForMostRecentPSA,
    chargeHistoryForMostRecentPSA,
    caseHistoryNotForMostRecentPSA,
    chargeHistoryNotForMostRecentPSA,
    chargeHistory,
    caseHistory
  ) => {
    const { loading } = this.props;
    return (
      <CaseHistoryWrapper>
        <StyledSectionHeader>
          Case History
          <Count>{caseHistory.size}</Count>
        </StyledSectionHeader>
        <Title withSubtitle>
          <span>Timeline</span>
          <span>Convictions in the past two years</span>
        </Title>
        <CaseHistoryTimeline caseHistory={caseHistory} chargeHistory={chargeHistory} />
        <hr />
        <CaseHistory
            loading={loading}
            caseHistoryForMostRecentPSA={caseHistoryForMostRecentPSA}
            chargeHistoryForMostRecentPSA={chargeHistoryForMostRecentPSA}
            caseHistoryNotForMostRecentPSA={caseHistoryNotForMostRecentPSA}
            chargeHistoryNotForMostRecentPSA={chargeHistoryNotForMostRecentPSA}
            chargeHistory={chargeHistory} />
      </CaseHistoryWrapper>
    );
  };

  render() {
    const {
      arrestDate,
      lastEditDateForPSA,
      loading,
      mostRecentPSA,
      neighbors,
      selectedPersonData
    } = this.props;
    const caseHistory = getCaseHistory(neighbors);
    const scores = mostRecentPSA.getIn([PSA_NEIGHBOR.DETAILS], Immutable.Map());
    const chargeHistory = getChargeHistory(neighbors);
    const {
      caseHistoryForMostRecentPSA,
      chargeHistoryForMostRecentPSA,
      caseHistoryNotForMostRecentPSA,
      chargeHistoryNotForMostRecentPSA
    } = getCasesForPSA(
      caseHistory,
      chargeHistory,
      scores,
      arrestDate,
      lastEditDateForPSA
    );
    return (
      <Wrapper>
        <StyledColumn>
          <StyledColumnRowWrapper>
            <StyledColumnRow>
              <AboutPersonGeneral selectedPersonData={selectedPersonData} />
            </StyledColumnRow>
          </StyledColumnRowWrapper>
          <StyledColumnRowWrapper>
            <StyledColumnRow>
              {(!loading) ? this.renderStatusOptions() : null}
              {this.renderPSAs()}
            </StyledColumnRow>
          </StyledColumnRowWrapper>
          <StyledColumnRowWrapper>
            <StyledColumnRow>
              {this.renderCaseHistory(
                caseHistoryForMostRecentPSA,
                chargeHistoryForMostRecentPSA,
                caseHistoryNotForMostRecentPSA,
                chargeHistoryNotForMostRecentPSA,
                chargeHistory,
                caseHistory
              )}
            </StyledColumnRow>
          </StyledColumnRowWrapper>
        </StyledColumn>
      </Wrapper>
    );
  }
}

export default AboutPerson;
