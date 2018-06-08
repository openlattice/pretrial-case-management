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
import { ButtonToolbar, Pagination, Tab, Tabs, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import PSAReviewRow from '../../components/review/PSAReviewRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CenteredContainer, PaddedRow, TitleLabel, StyledSelect } from '../../utils/Layout';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as Routes from '../../core/router/Routes';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';

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

const ErrorText = styled.div`
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

const SortContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SortText = styled.div`
  font-size: 14px;
  margin: -5px 0 5px 0;
`;

const SortButton = styled(ToggleButton)`
  -webkit-appearance: none !important;
`;

const DATE_FORMAT = 'MM/DD/YYYY';
const MAX_RESULTS = 10;

const SORT_TYPES = {
  DATE: 'DATE',
  NAME: 'NAME'
};

type Props = {
  history :string[],
  scoresEntitySetId :string,
  scoresAsMap :Immutable.Map<*, *>,
  psaNeighborsByDate :Immutable.Map<*, Immutable.Map<*, *>>,
  loadingResults :boolean,
  errorMessage :string,
  actions :{
    clearForm :() => void,
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
      riskFactorsEntity :Immutable.Map<*, *>,
      dmfEntitySetId :string,
      dmfId :string,
      dmfEntity :Object,
      dmfRiskFactorsEntitySetId :string,
      dmfRiskFactorsId :string,
      dmfRiskFactorsEntity :Object
    }) => void,
    updateNotes :(value :{
      notes :string,
      entityId :string,
      entitySetId :string,
      propertyTypes :Immutable.List<*>
    }) => void,
    checkPSAPermissions :() => void,
    submit :(value :{ config :Object, values :Object}) => void
  },
  psaNeighborsById :Immutable.Map<*, *>,
  allFilers :Immutable.Set<*>,
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>,
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
  },
  sort :string
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
      },
      sort: SORT_TYPES.NAME
    };
  }

  componentDidMount() {
    this.props.actions.checkPSAPermissions();
    this.props.actions.loadPSAsByDate();
  }

  componentWillUnmount() {
    this.props.actions.clearForm();
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
    let items = null;
    if (activeFilterKey === 1) {
      items = this.filterByDate();
    }
    else if (activeFilterKey === 2) {
      items = this.filterByPerson();
    }
    else if (activeFilterKey === 3) {
      items = this.filterByFiler();
    }

    if ((!items || !items.count()) && filters.searchExecuted) {
      return <NoResults>No results.</NoResults>;
    }

    if (items && items.count()) {
      items = this.sortRows(items);
    }

    return (
      <div>
        {items.slice(start, start + MAX_RESULTS).map(([scoreId, neighbors]) => this.renderRow(scoreId, neighbors))}
        {this.renderPagination(items.length)}
      </div>
    );
  }

  renderError = () => <ErrorText>{this.props.errorMessage}</ErrorText>

  renderRow = (scoreId, neighbors) => {
    const scores = this.props.scoresAsMap.get(scoreId, Immutable.Map());
    const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId'], '');
    const caseHistory = this.props.caseHistory.get(personId, Immutable.List());
    const manualCaseHistory = this.props.manualCaseHistory.get(personId, Immutable.List());
    const chargeHistory = this.props.chargeHistory.get(personId, Immutable.Map());
    const manualChargeHistory = this.props.manualChargeHistory.get(personId, Immutable.Map());
    const sentenceHistory = this.props.sentenceHistory.get(personId, Immutable.Map());
    const ftaHistory = this.props.ftaHistory.get(personId, Immutable.Map());
    return (
      <PSAReviewRow
          neighbors={neighbors}
          scores={scores}
          entityKeyId={scoreId}
          downloadFn={this.props.actions.downloadPSAReviewPDF}
          loadCaseHistoryFn={this.props.actions.loadCaseHistory}
          updateScoresAndRiskFactors={this.props.actions.updateScoresAndRiskFactors}
          updateNotes={this.updateNotes}
          submitData={this.props.actions.submit}
          caseHistory={caseHistory}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          sentenceHistory={sentenceHistory}
          ftaHistory={ftaHistory}
          readOnly={this.props.readOnly}
          key={scoreId} />
    );
  }

  sortByName = rowSeq => rowSeq.sort(([id1, neighbor1], [id2, neighbor2]) => {
    const p1 = neighbor1.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    const p2 = neighbor2.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());

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

  sortByDate = rowSeq => rowSeq.sort(([id1, neighbor1], [id2, neighbor2]) => {
    let latest1;
    let latest2;

    const getDate = (neighborObj, latest) => {
      const associationName = neighborObj.getIn(['associationEntitySet', 'name']);
      const ptFqn = associationName === ENTITY_SETS.ASSESSED_BY
        ? PROPERTY_TYPES.COMPLETED_DATE_TIME : PROPERTY_TYPES.DATE_TIME;
      const date = moment(neighborObj.getIn(['associationDetails', ptFqn, 0], ''));
      if (date.isValid()) {
        if (!latest || latest.isBefore(date)) {
          return date;
        }
      }
      return null;
    };

    neighbor1.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighborObj) => {
      const date = getDate(neighborObj, latest1);
      if (date) latest1 = date;
    });

    neighbor2.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighborObj) => {
      const date = getDate(neighborObj, latest2);
      if (date) latest2 = date;
    });

    if (latest1 && latest2) {
      return latest1.isAfter(latest2) ? -1 : 1;
    }

    if (latest1 || latest2) {
      return latest1 ? -1 : 1;
    }

    return 0;
  })

  sortRows = (rowSeq) => {
    const { sort } = this.state;
    if (sort === SORT_TYPES.NAME) {
      return this.sortByName(rowSeq).toArray();
    }
    if (sort === SORT_TYPES.DATE) {
      return this.sortByDate(rowSeq).toArray();
    }

    return [];
  }

  filterByFiler = () => {
    const { filer } = this.state.filters;
    if (!filer.length) return Immutable.Collection();
    const { psaNeighborsById } = this.props;

    return psaNeighborsById.entrySeq().filter(([scoreId, neighbors]) => {
      let includesFiler = false;
      neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighbor) => {
        if (neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID], Immutable.List()).includes(filer)) {
          includesFiler = true;
        }
      });
      return includesFiler;
    });
  }

  filterByPerson = () => {
    const { firstName, lastName, dob } = this.state.filters;
    if (!firstName.length && !lastName.length) return Immutable.Collection();
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
    });
  }

  filterByDate = () => {
    const { psaNeighborsByDate } = this.props;

    const date = moment(this.state.filters.date).format(DATE_FORMAT);
    return psaNeighborsByDate.get(date, Immutable.Map()).entrySeq();
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

  onSortChange = (sort) => {
    this.setState({ sort });
  }

  renderSortChoices = () => (
    <SortContainer>
      <SortText>Sort by:</SortText>
      <ButtonToolbar>
        <ToggleButtonGroup type="radio" name="sortPicker" value={this.state.sort} onChange={this.onSortChange}>
          <SortButton value={SORT_TYPES.NAME}>Name</SortButton>
          <SortButton value={SORT_TYPES.DATE}>Date</SortButton>
        </ToggleButtonGroup>
      </ButtonToolbar>
    </SortContainer>
  )

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
      <CenteredContainer>
        <Pagination
            prev
            next
            ellipsis
            boundaryLinks
            items={numPages}
            maxButtons={5}
            activePage={currPage}
            onSelect={page => this.updatePage((page - 1) * MAX_RESULTS)} />
      </CenteredContainer>
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
        {this.renderSortChoices()}
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
    manualCaseHistory: review.get('manualCaseHistory'),
    chargeHistory: review.get('chargeHistory'),
    manualChargeHistory: review.get('manualChargeHistory'),
    sentenceHistory: review.get('sentenceHistory'),
    ftaHistory: review.get('ftaHistory'),
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

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewPSA);
