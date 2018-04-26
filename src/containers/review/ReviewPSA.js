/*
 * @flow
 */

import React from 'react';
import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-bootstrap-date-picker';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Pager, Tab, Tabs } from 'react-bootstrap';

import PSAReviewRow from '../../components/review/PSAReviewRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PaddedRow, TitleLabel, StyledSelect } from '../../utils/Layout';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as Routes from '../../core/router/Routes';

const StyledFormViewWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 55px auto;
  width: 1300px;
`;

const StyledTitleWrapper = styled.div`
  align-items: center;
  color: #37454a;
  display: flex;
  font-size: 32px;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

const StyledSectionWrapper = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 55px;
  width: 100%;
`;

const CloseX = styled(FontAwesome)`
  cursor: pointer;
`;

const StyledTopFormNavBuffer = styled.div`
  height: 55px;
`;

const DatePickerTitle = styled.div`
  font-size: 18px;
  margin: 15px 0;
  text-align: center;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const DatePickerGroupContainer = styled.div`
  max-width: 300px;
  margin: 10px;
`;

const NoResults = styled.div`
  width: 100%;
  font-size: 16px;
  text-align: center;
`;

const Error = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: firebrick;
  margin-top: 15px;
`;

const LoadingText = styled.div`
  font-size: 20px;
  margin: 15px;
`;

const SearchRow = styled(PaddedRow)`
  align-items: flex-end;
  justify-content: center;
  margin: 10px;
`;

const DATE_FORMAT = 'MM/DD/YYYY';
const MAX_RESULTS = 10;

type Props = {
  history :string[],
  scoresEntitySetId :string,
  scoresAsMap :Immutable.Map<*, *>,
  psaNeighborsByDate :Immutable.Map<*, Immutable.Map<*, *>>,
  loadingResults :boolean,
  errorMessage :string,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    loadPSAsByDate :() => void,
    updateScoresAndRiskFactors :(values :{
      scoresEntitySetId :string,
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>,
      riskFactorsEntitySetId :string,
      riskFactorsId :string,
      riskFactorsEntity :Immutable.Map<*, *>
    }) => void,
    updateNotes :(value :{
      notes :string,
      entityId :string,
      entitySetId :string,
      propertyTypes :Immutable.List<*>
    }) => void,
    checkPSAPermissions :() => void,
  },
  psaNeighborsById :Immutable.Map<*, *>,
  allFilers :Immutable.Set<*>,
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  readOnly :boolean
}

type State = {
  activeFilterKey :number,
  filters :{
    date :string,
    firstName :string,
    lastName :string,
    dob :string,
    filer :string,
    start :number
  }
};

class ReviewPSA extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      activeFilterKey: 1,
      filters: {
        date: moment().format(),
        firstName: '',
        lastName: '',
        dob: '',
        filer: '',
        start: 0,
        searchExecuted: false
      }
    };
  }

  componentDidMount() {
    this.props.actions.checkPSAPermissions();
    this.props.actions.loadPSAsByDate();
  }

  updateFilters = (newFilters :Object) => {
    const filters = Object.assign({}, {
      date: '',
      firstName: '',
      lastName: '',
      dob: '',
      filer: '',
      start: 0,
      searchExecuted: true
    }, newFilters);
    this.setState({ filters });
  }

  handleClose = () => {
    this.updateFilters({ date: moment().format() });
    this.props.history.push(Routes.DASHBOARD);
  }

  renderDateRangePicker = () => {
    const { date } = this.state.filters;

    return (
      <DateRangeContainer>
        <DatePickerGroupContainer>
          <div>PSA Date:</div>
          <DatePicker
              value={date}
              onChange={(newDate) => {
                this.updateFilters({ date: newDate });
              }} />
        </DatePickerGroupContainer>
      </DateRangeContainer>
    );
  }

  renderPersonFilter = () => {
    const handleSubmit = (firstName, lastName, dob) => {
      this.updateFilters({ firstName, lastName, dob });
    };
    return <PersonSearchFields handleSubmit={handleSubmit} />;
  }

  renderFilerFilter = () => {
    const filerOptions = this.props.allFilers.map(filer => <option key={filer} value={filer}>{filer}</option>);

    return (
      <SearchRow>
        <TitleLabel>Select a filer.</TitleLabel>
        <StyledSelect
            value={this.state.filters.filer}
            onChange={(e) => {
              this.updateFilters({ filer: e.target.value });
            }}>
          <option value="">Select</option>
          { filerOptions }
        </StyledSelect>
      </SearchRow>
    );
  }

  renderSpinner = () => (
    <div>
      <LoadingText>Loading past reports...</LoadingText>
      <LoadingSpinner />
    </div>
  )

  onInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleFilterRequest = () => {
    const { activeFilterKey, filters } = this.state;
    const { start } = filters;
    let items = [];
    if (activeFilterKey === 1) {
      items = this.filterByDate();
    }
    else if (activeFilterKey === 2) {
      items = this.filterByPerson();
    }
    else if (activeFilterKey === 3) {
      items = this.filterByFiler();
    }
    if (!items.length && filters.searchExecuted) {
      return <NoResults>No results.</NoResults>;
    }
    return (
      <div>
        {items.slice(start, start + MAX_RESULTS).map(([scoreId, neighbors]) => this.renderRow(scoreId, neighbors))}
        {this.renderPagination(items.length)}
      </div>
    );
  }

  renderError = () => <Error>{this.props.errorMessage}</Error>

  renderRow = (scoreId, neighbors) => {
    const scores = this.props.scoresAsMap.get(scoreId, Immutable.Map());
    const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId'], '');
    const caseHistory = this.props.caseHistory.get(personId, Immutable.List());
    const chargeHistory = this.props.chargeHistory.get(personId, Immutable.Map());
    return (
      <PSAReviewRow
          neighbors={neighbors}
          scores={scores}
          entityKeyId={scoreId}
          downloadFn={this.props.actions.downloadPSAReviewPDF}
          loadCaseHistoryFn={this.props.actions.loadCaseHistory}
          updateScoresAndRiskFactors={this.updateScoresAndRiskFactors}
          updateNotes={this.updateNotes}
          caseHistory={caseHistory}
          chargeHistory={chargeHistory}
          readOnly={this.props.readOnly}
          key={scoreId} />
    );
  }

  filterByFiler = () => {
    const { filer } = this.state.filters;
    if (!filer.length) return [];
    const { psaNeighborsById } = this.props;

    return psaNeighborsById.entrySeq().filter(([scoreId, neighbors]) => neighbors.getIn(
      [ENTITY_SETS.STAFF, 'neighborDetails', PROPERTY_TYPES.PERSON_ID],
      Immutable.List()
    ).includes(filer)).toArray();
  }

  filterByPerson = () => {
    const { firstName, lastName, dob } = this.state.filters;
    if (!firstName.length && !lastName.length) return [];
    const { psaNeighborsById } = this.props;

    return psaNeighborsById.entrySeq().filter(([scoreId, neighbors]) => {
      const neighborFirst = neighbors.getIn(
        [ENTITY_SETS.PEOPLE, 'neighborDetails', PROPERTY_TYPES.FIRST_NAME],
        Immutable.List()
      );
      const neighborLast = neighbors.getIn(
        [ENTITY_SETS.PEOPLE, 'neighborDetails', PROPERTY_TYPES.LAST_NAME],
        Immutable.List()
      );
      const neighborDob = neighbors.getIn(
        [ENTITY_SETS.PEOPLE, 'neighborDetails', PROPERTY_TYPES.DOB],
        Immutable.List()
      );

      if (!neighborFirst.filter(val => val.toLowerCase().includes(firstName.toLowerCase())).size) return false;
      if (!neighborLast.filter(val => val.toLowerCase().includes(lastName.toLowerCase())).size) return false;
      if (dob && dob.length
        && !neighborDob.filter(val => val.toLowerCase().includes(dob.split('T')[0])).size) return false;

      return true;
    }).toArray();

  }

  filterByDate = () => {
    const { psaNeighborsByDate } = this.props;

    const date = moment(this.state.filters.date).format(DATE_FORMAT);
    return psaNeighborsByDate.get(date, Immutable.Map()).keySeq()
      .sort((id1, id2) => {
        const p1 = psaNeighborsByDate.getIn([date, id1, ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
        const p2 = psaNeighborsByDate.getIn([date, id2, ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

        const p1Last = p1.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
        const p2Last = p2.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
        if (p1Last !== p2Last) return p1Last < p2Last ? -1 : 1;

        const p1First = p1.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
        const p2First = p2.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
        if (p1First !== p2First) return p1First < p2First ? -1 : 1;

        const p1Dob = moment(p1.getIn([PROPERTY_TYPES.DOB, 0], ''));
        const p2Dob = moment(p2.getIn([PROPERTY_TYPES.DOB, 0], ''));
        if (p1Dob.isValid() && p2Dob.isValid()) return p1Dob.isBefore(p2Dob) ? -1 : 1;

        return 0;
      })
      .map(id => [id, psaNeighborsByDate.getIn([date, id], Immutable.Map())])
      .toArray();
  }

  onFilterSelect = (activeFilterKey) => {
    this.setState({ activeFilterKey });
    this.updateFilters({ searchExecuted: false });
  }

  renderFilters = () => (
    <div>
      <DatePickerTitle>Filter Submitted PSA Forms</DatePickerTitle>
      <Tabs id="filter" activeKey={this.state.activeFilterKey} onSelect={this.onFilterSelect}>
        <Tab eventKey={1} title="Date">{this.renderDateRangePicker()}</Tab>
        <Tab eventKey={2} title="Person">{this.renderPersonFilter()}</Tab>
        <Tab eventKey={3} title="Filer">{this.renderFilerFilter()}</Tab>
      </Tabs>
      <hr />
    </div>
  )

  updateScoresAndRiskFactors = (scoresId, scoresEntity, riskFactorsEntitySetId, riskFactorsId, riskFactorsEntity) => {
    const { scoresEntitySetId, actions } = this.props;
    actions.updateScoresAndRiskFactors({
      scoresEntitySetId,
      scoresId,
      scoresEntity,
      riskFactorsEntitySetId,
      riskFactorsId,
      riskFactorsEntity
    });
  }

  updateNotes = (notes, entityId, entitySetId, propertyTypes) => {
    this.props.actions.updateNotes({
      notes,
      entityId,
      entitySetId,
      propertyTypes
    });
  }

  updatePage = (start) => {
    this.setState({ filters: Object.assign({}, this.state.filters, { start }) });
  }

  renderPagination = (numResults) => {
    const { start } = this.state.filters;
    if (numResults <= MAX_RESULTS) return null;
    const numPages = Math.ceil(numResults / MAX_RESULTS);
    const currPage = (start / MAX_RESULTS) + 1;
    return (
      <Pager>
        <Pager.Item
            previous
            onClick={() => this.updatePage(start - MAX_RESULTS)}
            disabled={currPage === 1}>
          &larr;
        </Pager.Item>
        <Pager.Item
            next
            onClick={() => this.updatePage(start + MAX_RESULTS)}
            disabled={currPage === numPages}>
          &rarr;
        </Pager.Item>
      </Pager>
    );
  }

  renderContent = () => {
    if (this.props.loadingResults) {
      return <StyledSectionWrapper>{this.renderSpinner()}</StyledSectionWrapper>;
    }
    return (
      <StyledSectionWrapper>
        {this.renderError()}
        {this.renderFilters()}
        {this.handleFilterRequest()}
        <StyledTopFormNavBuffer />
      </StyledSectionWrapper>
    );
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Review PSA Forms</div>
            <CloseX name="close" onClick={this.handleClose} />
          </StyledTitleWrapper>
          {this.renderContent()}
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get('review');
  return {
    scoresEntitySetId: review.get('scoresEntitySetId'),
    scoresAsMap: review.get('scoresAsMap'),
    psaNeighborsByDate: review.get('psaNeighborsByDate'),
    psaNeighborsById: review.get('psaNeighborsById'),
    allFilers: review.get('allFilers'),
    loadingResults: review.get('loadingResults'),
    errorMesasge: review.get('errorMesasge'),
    caseHistory: review.get('caseHistory'),
    chargeHistory: review.get('chargeHistory'),
    readOnly: review.get('readOnly')
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewPSA);
