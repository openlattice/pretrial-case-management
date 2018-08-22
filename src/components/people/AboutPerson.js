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
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES, PSA_STATUSES } from '../../utils/consts/Consts';
import { STATUS_OPTION_CHECKBOXES } from '../../utils/consts/ReviewPSAConsts';

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
  background: white;
  border-radius: 5px;
`;

const StyledColumnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #e1e1eb;
`;

const StyledSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #555e6f;
  margin-bottom: 50px;
`;

const Count = styled.div`
  height: fit-content;
  padding: 0 10px;
  margin: 0 10px;
  border-radius: 10px;
  background-color: #f0f0f7;
  font-size: 12px;
  color: #8e929b;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
  margin-bottom: 20px;

  span:first-child {
    font-weight: ${props => (props.withSubtitle ? '600' : '400')};
    padding-bottom: 5px;
  }
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
  transform: translateX(45%) translateY(50%);
`;

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>
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
    const values = this.state.statusFilters;

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
    const statusOptions = Object.values(STATUS_OPTION_CHECKBOXES);
    return (
      <FilterWrapper>
        <MultiSelectCheckbox
            displayTitle="Filter Status"
            options={statusOptions}
            onChange={this.handleCheckboxChange}
            selected={this.state.statusFilters} />
      </FilterWrapper>
    );
  }

  renderPSAs = () => {
    const { neighbors } = this.props;
    const scoreSeq = neighbors.get(ENTITY_SETS.PSA_SCORES, Immutable.Map())
      .filter(neighbor => !!neighbor.get('neighborDetails') &&
        this.state.statusFilters.includes(neighbor.getIn(['neighborDetails', PROPERTY_TYPES.STATUS, 0])))
      .map(neighbor => [neighbor.getIn(['neighborDetails', OPENLATTICE_ID_FQN, 0]), neighbor.get('neighborDetails')]);
    return (
      <PSAReviewPersonRowList
          scoreSeq={scoreSeq}
          sort={SORT_TYPES.DATE}
          renderContent={this.renderHeaderSection}
          component={CONTENT_CONSTS.PROFILE}
          hideCaseHistory
          hideProfile
          personProfile />
    );
  };

  renderCaseHistory = () => {
    const { neighbors } = this.props;
    const caseHistory = neighbors.get(ENTITY_SETS.PRETRIAL_CASES, Immutable.List())
      .map(neighborObj => neighborObj.get('neighborDetails', Immutable.Map()));

    let chargeHistory = Immutable.Map();
    neighbors.get(ENTITY_SETS.CHARGES, Immutable.List())
      .forEach((chargeNeighbor) => {
        const chargeIdArr = chargeNeighbor.getIn(['neighborDetails', PROPERTY_TYPES.CHARGE_ID, 0], '').split('|');
        if (chargeIdArr.length) {
          const caseId = chargeIdArr[0];
          chargeHistory = chargeHistory.set(
            caseId,
            chargeHistory.get(caseId, Immutable.List()).push(chargeNeighbor.get('neighborDetails', Immutable.Map()))
          );
        }
      });

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
        <CaseHistory caseHistory={caseHistory} chargeHistory={chargeHistory} />
      </CaseHistoryWrapper>
    );
  };
  render() {
    const { selectedPersonData } = this.props;

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
              {this.renderStatusOptions()}
              {this.renderPSAs()}
            </StyledColumnRow>
          </StyledColumnRowWrapper>
          <StyledColumnRowWrapper>
            <StyledColumnRow>
              {this.renderCaseHistory()}
            </StyledColumnRow>
          </StyledColumnRowWrapper>
        </StyledColumn>
      </Wrapper>
    );
  }
}

export default AboutPerson;
