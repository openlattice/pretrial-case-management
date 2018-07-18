/*
 * @flow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-bootstrap-date-picker';
import StyledDatePicker from '../../components/controls/StyledDatePicker';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import PSAReviewReportsRowList from './PSAReviewReportsRowList';
import LoadingSpinner from '../../components/LoadingSpinner';
import DropDownMenu from '../../components/StyledSelect';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES, SORT_TYPES } from '../../utils/consts/Consts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import { PaddedRow, TitleLabel } from '../../utils/Layout';
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
  width: 960px;
`;

const StyledSectionWrapper = styled.div`
  color: #555e6f;
  display: flex;
  flex-direction: column;
  width: 960px;
`;

const StyledSearchWrapper = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e1e1eb;
  margin-bottom: 20px;
`

const StyledTopFormNavBuffer = styled.div`
  height: 55px;
`;

const StyledFiltersBar = styled.div`
  font-size: 14px;
  margin: 15px 30px;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  width: 25%;
  span {
    margin-top: 10px;
  }
`;

const PersonSearchWrapper = styled.div`
  margin: 0;
`

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 25%;
  margin-top: 10px;
`;

const DatePickerGroupContainer = styled.div`
  max-width: 140px;
  margin: 10px;
`;

const NoResults = styled.div`
  width: 100%;
  font-size: 16px;
  text-align: center;
  width: 960px;
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

const DATE_FORMAT = 'MM/DD/YYYY';

const STATUS_OPTIONS = {
  OPEN: {
    value: PSA_STATUSES.OPEN,
    label: 'All Open'
  },
  SUCCESS: {
    value: PSA_STATUSES.SUCCESS,
    label: 'Successful'
  },
  FAILURE: {
    value: PSA_STATUSES.FAILURE,
    label: 'Failed'
  },
  CANCELLED: {
    value: PSA_STATUSES.CANCELLED,
    label: 'Cancelled'
  },
  DECLINED: {
    value: PSA_STATUSES.DECLINED,
    label: 'Declined'
  },
  DISMISSED: {
    value: PSA_STATUSES.DISMISSED,
    label: 'Dismissed'
  },
  ALL: {
    value: '*',
    label: 'All'
  },
  REQUIRES_ACTION: {
    value: PSA_STATUSES.OPEN,
    label: 'Requires Action'
  }
};

const openOptions = [
  {
    value: 'OPEN',
    label: 'All Open'
  },
  {
    value: 'REQUIRES_ACTION',
    label: 'Requires Action'
  }
];

const closedOptions = [
  {
    value: 'SUCCESS',
    label: 'Successful'
  },
  {
    value: 'FAILURE',
    label: 'Failed'
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled'
  },
  {
    value: 'DECLINED',
    label: 'Declined'
  },
  {
    value: 'DISMISSED',
    label: 'Dismissed'
  }
];

const STATUS_OPTIONS_ARR = [
  {
    value: 'ALL',
    label: 'All',
  },
  {
    label: 'Open',
    options: openOptions
  },
  {
    label: 'Closed',
    options: closedOptions
  }
];

const DOMAIN_OPTIONS_ARR = [
  {
    value: "",
    label: 'All'
  },
  {
    value: DOMAIN.PENNINGTON,
    label: 'Pennington'
  },
  {
    value: DOMAIN.MINNEHAHA,
    label: 'Minnehaha'
  },
]

const SORT_OPTIONS_ARR = [
  {
    value: SORT_TYPES.NAME,
    label: 'Name'
  },
  {
    value: SORT_TYPES.DATE,
    label: 'Date'
  },
]

const NAV_OPTIONS = [
  {
    path: Routes.REVIEW_REPORTS,
    label: 'View All'
  },
  {
    path: Routes.SEARCH_FORMS,
    label: 'Search'
  }
];

type Props = {
  history :string[],
  scoresAsMap :Immutable.Map<*, *>,
  psaNeighborsByDate :Immutable.Map<*, Immutable.Map<*, *>>,
  loadingResults :boolean,
  errorMessage :string,
  actions :{
    loadPSAsByDate :(filter :string) => void
  },
  psaNeighborsById :Immutable.Map<*, *>,
  allFilers :Immutable.Set<*>
}

type State = {
  activeFilterKey :number,
  filters :{
    date :string,
    firstName :string,
    lastName :string,
    dob :string,
    filer :string
  },
  sort :string,
  status :string,
  domain :string
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
        searchExecuted: false
      },
      sort: SORT_TYPES.NAME,
      status: 'OPEN',
      domain: ''
    };
  }

  componentDidMount() {
    this.props.actions.loadPSAsByDate(STATUS_OPTIONS[this.state.status].value);
  }

  componentWillReceiveProps(newProps) {
    let activeFilterKey;
    let date;
    if (newProps.location.pathname === Routes.REVIEW_REPORTS) {
      activeFilterKey = 1;
      date = moment().format();
    } else {
      activeFilterKey = 2;
      date = '';
    }
    if (this.props.location.pathname !== newProps.location.pathname) {
      this.setState(
        {
          activeFilterKey: activeFilterKey,
          status: 'OPEN',
          filters: {
              date: date,
              firstName: '',
              lastName: '',
              dob: '',
              filer: '',
              searchExecuted: false
          }
        });
      this.handleFilterRequest();
    }
  }

  updateFilters = (newFilters :Object) => {
    const existingFilters = this.state.filters
    const filters = Object.assign({}, existingFilters, newFilters);
    this.setState({ filters });
    this.handleFilterRequest();
  }

  handleClose = () => {
    this.updateFilters({ date: moment().format() });
    this.props.history.push(Routes.DASHBOARD);
  }

  renderDateRangePicker = () => {
    const { date } = this.state.filters;

    return (
      <DateRangeContainer>
        <span>PSA Date </span>
        <DatePickerGroupContainer>
          <StyledDatePicker
              value={date}
              onChange={(newDate) => {
                this.updateFilters({ date: newDate });
              }} />
        </DatePickerGroupContainer>
      </DateRangeContainer>
    );
  }

  renderFilerOptions = () => {
    const allFilers = this.props.allFilers.toArray().map(filer => {
      return (
        {
          value: filer,
          label: filer,
        }
      )
    });
    const filerOptions = [{ value: "", label: "All"}].concat(allFilers);
    return (
      <FilterWrapper>
        <span>Filer </span>
        <DropDownMenu
            placeholder="All"
            classNamePrefix="lattice-select"
            onChange={(e) => {
              this.updateFilters({ filer: e.value });
            }}
            options={filerOptions}
          />
      </FilterWrapper>
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
    const { filer } = this.state.filters;
    const { scoresAsMap } = this.props;
    const expiredView = this.state.status === 'REQUIRES_ACTION';
    let items = null;
    if (expiredView) {
      items = this.filterExpired();
    }
    else if (activeFilterKey === 1) {
      items = this.filterByDate();
    }
    else if (activeFilterKey === 2) {
      items = this.filterByPerson();
    }

    if (!!filer) items = this.filterByFiler(items);

    if (!items || !items.count()) {
      return <NoResults>No results.</NoResults>;
    }

    const sort = expiredView ? null : this.state.sort;
    return <PSAReviewReportsRowList scoreSeq={items.map(([id]) => ([id, scoresAsMap.get(id)]))} sort={sort} />;
  }

  renderError = () => <ErrorText>{this.props.errorMessage}</ErrorText>

  filterWithoutDate = () => {
    let results = Immutable.Map();
    const keys = this.props.psaNeighborsByDate.keySeq();

    keys.forEach( date => {
      results = results.merge(this.props.psaNeighborsByDate.get(date, Immutable.Map())
        .entrySeq()
        .filter(([scoreId, neighbors]) => {
          if (!this.domainMatch(neighbors)) return false;

          const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails', PROPERTY_TYPES.PERSON_ID, 0]);
          if (personId) return true;
        })
      );
    })
    return results.entrySeq();
  }

  filterExpired = () => {
    let rowsByName = Immutable.Map();
    const date = moment(this.state.filters.date).format(DATE_FORMAT);

    if (this.state.filters.date === '' || !this.state.filters.date) {
      return this.filterWithoutDate();
    }
    return this.props.psaNeighborsByDate.get(date, Immutable.Map())
      .entrySeq()
      .filter(([scoreId, neighbors]) => {
        if (!this.domainMatch(neighbors)) return false;

        const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails', PROPERTY_TYPES.PERSON_ID, 0]);
        if (personId) return true;
      });
  }

  domainMatch = neighbors => (
    !this.state.domain.length
      || neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).filter((neighbor) => {
        if (!neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '').endsWith(this.state.domain)) {
          return false;
        }

        return true;
      }).size
  )

  filterByFiler = (items) => {
    const { filer } = this.state.filters;

    return items.filter(([scoreId, neighbors]) => {
      if (!this.domainMatch(neighbors)) return false;
      let includesFiler = false;
      neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighbor) => {
        if (neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID], Immutable.List()).includes(this.state.filters.filer)) {
          includesFiler = true;
        }
      });
      return includesFiler;
    });
  }
  renderPersonFilter = () => {
    const handleSubmit = (firstName, lastName, dob) => {
      this.setState({activeFilterKey: 2});
      this.updateFilters({ firstName, lastName, dob });
    };
    return (
      <div>
        <PersonSearchWrapper>
        <PersonSearchFields
          handleSubmit={handleSubmit}
          firstName={this.state.filters.firstName}
          lastName={this.state.filters.lastName}
          dob={this.state.filters.dob}
        />
        </PersonSearchWrapper>
        <hr/>
        <StyledFiltersBar>
          {this.renderStatusOptions()}
          {this.renderDomainChoices()}
          {this.renderFilerOptions()}
          {this.renderSortChoices()}
        </StyledFiltersBar>
      </div>
    )
  }

  filterByPerson = () => {
    const { firstName, lastName, dob } = this.state.filters;
    if (!firstName.length && !lastName.length) return Immutable.Collection();
    const { psaNeighborsById } = this.props;

    return psaNeighborsById.entrySeq().filter(([scoreId, neighbors]) => {
      if (!this.domainMatch(neighbors)) return false;

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

    if (this.state.filters.date === '' || !this.state.filters.date) {
      return this.filterWithoutDate();
    }

    return psaNeighborsByDate.get(date, Immutable.Map())
      .entrySeq()
      .filter(([scoreId, neighbors]) => this.domainMatch(neighbors));
  }

  onFilterSelect = (activeFilterKey) => {
    this.setState({ activeFilterKey });
    this.updateFilters({ searchExecuted: false });
  }

  changeStatus = (status) => {
    if (status !== this.state.status) {
      this.setState({ status });
      this.props.actions.loadPSAsByDate(STATUS_OPTIONS[status].value);
      // this.updateFilters({ date: moment().format() });
    }
  }

  renderStatusOptions = () => (
    <FilterWrapper>
      <span>PSA Status </span>
      <DropDownMenu
        placeholder={STATUS_OPTIONS[this.state.status].label}
        classNamePrefix="lattice-select"
        options={STATUS_OPTIONS_ARR}
        onChange={(e) => {
          this.changeStatus(e.value)}
        }
      />
    </FilterWrapper>
  )

  changeDomain = (domain) => {
    this.setState({ domain });
  }

  renderDomainChoices = () => (
    <FilterWrapper>
      <span>County </span>
      <DropDownMenu
        placeholder={"All"}
        classNamePrefix="lattice-select"
        options={DOMAIN_OPTIONS_ARR}
        onChange={(e) => {
          this.changeDomain(e.value)}
        }
      />
    </FilterWrapper>
  )

  renderFilters = () => {
    return (
      <div>
        <StyledFiltersBar>
          {this.renderStatusOptions()}
          {this.renderDomainChoices()}
          {this.renderDateRangePicker()}
          {this.renderFilerOptions()}
        </StyledFiltersBar>
        <hr/>
        <StyledFiltersBar>
        {this.renderSortChoices()}
        </StyledFiltersBar>
      </div>
    )
  }

  onSortChange = (sort) => {
    this.setState({ sort });
  }

  renderSortChoices = () => (this.state.status === 'REQUIRES_ACTION' ? null : (
      <FilterWrapper>
        <span>Sort by </span>
        <DropDownMenu
          placeholder='Name'
          classNamePrefix="lattice-select"
          options={SORT_OPTIONS_ARR}
          onChange={(e) => {
            this.onSortChange(e.value)}
          }
        />
      </FilterWrapper>
  ))

  renderContent = () => {
    if (this.props.loadingResults) {
      return <StyledSectionWrapper>{this.renderSpinner()}</StyledSectionWrapper>;
    }
    return (
      <StyledSectionWrapper>
      <NavButtonToolbar options={NAV_OPTIONS}/>
        <StyledSearchWrapper>
          {this.renderError()}
          <Switch>
            <Route path={Routes.SEARCH_FORMS} render={this.renderPersonFilter} />
            <Route path={Routes.REVIEW_REPORTS} render={this.renderFilters} />
            <Redirect from={Routes.REVIEW_FORMS} to={Routes.REVIEW_REPORTS} />
          </Switch>
        </StyledSearchWrapper>
        {this.handleFilterRequest()}
        <StyledTopFormNavBuffer />
      </StyledSectionWrapper>
    );
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          {this.renderContent()}
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get('review');
  return {
    scoresAsMap: review.get('scoresAsMap'),
    psaNeighborsByDate: review.get('psaNeighborsByDate'),
    psaNeighborsById: review.get('psaNeighborsById'),
    allFilers: review.get('allFilers'),
    loadingResults: review.get('loadingResults') || review.get('loadingPSAData'),
    errorMessage: review.get('errorMessage')
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
