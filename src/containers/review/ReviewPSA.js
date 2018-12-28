/*
 * @flow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Immutable from 'immutable';
import moment from 'moment';

import DatePicker from '../../components/datetime/DatePicker';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import PSAReviewReportsRowList from './PSAReviewReportsRowList';
import LoadingSpinner from '../../components/LoadingSpinner';
import DropDownMenu from '../../components/StyledSelect';
import { FullWidthContainer, NoResults } from '../../utils/Layout';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import {
  APP,
  STATE,
  REVIEW,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';
import {
  DATE_FORMAT,
  STATUS_OPTIONS,
  STATUS_OPTIONS_ARR,
  DOMAIN_OPTIONS_ARR,
  SORT_OPTIONS_ARR,
  NAV_OPTIONS
} from '../../utils/consts/ReviewPSAConsts';

import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as Routes from '../../core/router/Routes';

const { PEOPLE, STAFF } = APP_TYPES_FQNS;

const peopleFqn :string = PEOPLE.toString();
const staffFqn :string = STAFF.toString();


const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 960px;
`;

const StyledSectionWrapper = styled.div`
  color:  ${OL.GREY01};
  display: flex;
  flex-direction: column;
  width: 960px;
`;

const StyledSearchWrapper = styled.div`
  width: 100%;
`;

const StyledTopFormNavBuffer = styled.div`
  height: 55px;
`;

const StyledFiltersBar = styled.div`
  width: 100%;
  background: ${OL.WHITE};
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
  padding: 0 30px;
  font-size: 14px;
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
  width: 100%;
  background: ${OL.WHITE};
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  border-bottom: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding-top: 20px;
  padding-bottom: 20px;
  margin: 0;
`;

const BottomFiltersWrapper = styled.div`
  width: 100%;
  max-width: 713px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 25%;
  margin-top: 10px;
`;

const DatePickerGroupContainer = styled.div`
  width: 100%;
  max-width: 140px;
  margin: 10px;
`;

const ErrorText = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: firebrick;
  margin-top: 15px;
`;

const LoadingText = styled.div`
  margin-top: 39vh;
  width: 100%;
  font-size: 16px;
  text-align: center;
  width: 960px;
  margin-bottom: 20px;
`;

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
  allFilers :Immutable.Set<*>,
  selectedOrganizationId :string
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
  domain :string,
  location :Object
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
    const { status } = this.state;
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      actions.loadPSAsByDate(STATUS_OPTIONS[status].value);
    }
  }

  componentDidUpdate(prevProps) {
    const { status } = this.state;
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.loadPSAsByDate(STATUS_OPTIONS[status].value);
    }
  }

  componentWillReceiveProps(newProps) {
    let activeFilterKey;
    let date;
    if (newProps.location.pathname === Routes.REVIEW_REPORTS) {
      activeFilterKey = 1;
      date = moment().format();
    }
    else {
      activeFilterKey = 2;
      date = '';
    }
    if (this.props.location.pathname !== newProps.location.pathname) {
      this.setState(
        {
          activeFilterKey,
          filters: {
            date,
            firstName: '',
            lastName: '',
            dob: '',
            filer: '',
            searchExecuted: false
          }
        }
      );
      this.handleFilterRequest();
    }
  }

  updateFilters = (newFilters :Object) => {
    const existingFilters = this.state.filters;
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
          <DatePicker
              value={date}
              onChange={(newDate) => {
                this.updateFilters({ date: newDate });
              }} />
        </DatePickerGroupContainer>
      </DateRangeContainer>
    );
  }

  renderFilerOptions = () => {
    let { allFilers } = this.props;
    allFilers = allFilers.toArray().map(filer => (
      {
        value: filer,
        label: filer
      }
    ));
    const filerOptions = [{ value: '', label: 'All' }].concat(allFilers);
    return (
      <FilterWrapper>
        <span>Filer </span>
        <DropDownMenu
            placeholder="All"
            classNamePrefix="lattice-select"
            onChange={(e) => {
              this.updateFilters({ filer: e.value });
            }}
            options={filerOptions} />
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
    const { filer } = filters;
    const { scoresAsMap } = this.props;
    const { sort } = this.state;

    let items = null;

    if (activeFilterKey === 1) {
      items = this.filterByDate();
    }
    else if (activeFilterKey === 2) {
      items = this.filterByPerson();
    }

    if (filer) items = this.filterByFiler(items);

    if (!items || !items.count()) {
      return <NoResults>No results.</NoResults>;
    }

    return (
      <PSAReviewReportsRowList
          scoreSeq={items.map(([id]) => ([id, scoresAsMap.get(id)]))}
          sort={sort}
          activeFilterKey={activeFilterKey}
          renderContent={this.renderBottomFilters}
          component={CONTENT_CONSTS.REVIEW} />
    );
  }

  renderError = () => <ErrorText>{this.props.errorMessage}</ErrorText>


  filterWithoutDate = () => {
    const { psaNeighborsByDate } = this.props;
    let results = Immutable.Map();
    const keys = psaNeighborsByDate.keySeq();

    keys.forEach((date) => {
      results = results.merge(psaNeighborsByDate.get(date, Immutable.Map())
        .entrySeq()
        .filter(([scoreId, neighbors]) => {

          if (!this.domainMatch(neighbors)) return false;

          const personId = neighbors.getIn([peopleFqn, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]);
          if (personId) return true;
        }));
    });
    return results.entrySeq();
  }

  domainMatch = neighbors => (
    !this.state.domain.length
      || neighbors.get(staffFqn, Immutable.List()).filter((neighbor) => {
        if (!neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '').endsWith(this.state.domain)) {
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
      neighbors.get(staffFqn, Immutable.List()).forEach((neighbor) => {
        if (neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID], Immutable.List()).includes(filer)) {
          includesFiler = true;
        }
      });
      return includesFiler;
    });
  }

  renderPersonFilter = () => {
    const { filters } = this.state;
    const handleSubmit = ({ firstName, lastName, dob }) => {
      this.setState({ activeFilterKey: 2 });
      this.updateFilters({ firstName, lastName, dob });
    };
    return (
      <div>
        <PersonSearchWrapper>
          <PersonSearchFields
              handleSubmit={handleSubmit}
              firstName={filters.firstName}
              lastName={filters.lastName}
              dob={filters.dob} />
        </PersonSearchWrapper>
      </div>
    );
  }

  filterByPerson = () => {
    const { filters } = this.state;
    const { firstName, lastName, dob } = filters;
    if (!firstName.length && !lastName.length) return Immutable.Collection();
    const { psaNeighborsById } = this.props;

    return psaNeighborsById.entrySeq().filter(([scoreId, neighbors]) => {
      if (!this.domainMatch(neighbors)) return false;

      const neighborFirst = neighbors.getIn(
        [peopleFqn, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.FIRST_NAME],
        Immutable.List()
      );
      const neighborLast = neighbors.getIn(
        [peopleFqn, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.LAST_NAME],
        Immutable.List()
      );
      const neighborDob = neighbors.getIn(
        [peopleFqn, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DOB],
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
    const { filters } = this.state;
    const date = moment(filters.date).format(DATE_FORMAT);

    if (filters.date === '' || !filters.date) {
      return this.filterWithoutDate();
    }

    return psaNeighborsByDate.get(date, Immutable.Map())
      .entrySeq()
      .filter(([scoreId, neighbors]) => this.domainMatch(neighbors));
  }

  changeStatus = (nextStatus) => {
    const { actions } = this.props;
    const { status } = this.state;
    if (nextStatus !== status) {
      this.setState({ status: nextStatus });
      actions.loadPSAsByDate(STATUS_OPTIONS[nextStatus].value);
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
            this.changeStatus(e.value);
          }} />
    </FilterWrapper>
  )

  changeDomain = (domain) => {
    this.setState({ domain });
  }

  renderDomainChoices = () => (
    <FilterWrapper>
      <span>County </span>
      <DropDownMenu
          placeholder="All"
          classNamePrefix="lattice-select"
          options={DOMAIN_OPTIONS_ARR}
          onChange={(e) => {
            this.changeDomain(e.value);
          }} />
    </FilterWrapper>
  )

  renderTopFilters = () => (
    <div>
      <StyledFiltersBar>
        {this.renderStatusOptions()}
        {this.renderDomainChoices()}
        {this.renderDateRangePicker()}
        {this.renderFilerOptions()}
      </StyledFiltersBar>
    </div>
  );

  renderBottomFilters = () => {
    const { activeFilterKey } = this.state;
    if (activeFilterKey === 1) {
      return (
        <BottomFiltersWrapper>
          {this.renderSortChoices()}
        </BottomFiltersWrapper>
      );
    }

    return (
      <BottomFiltersWrapper>
        {this.renderStatusOptions()}
        {this.renderDomainChoices()}
        {this.renderFilerOptions()}
        {this.renderSortChoices()}
      </BottomFiltersWrapper>
    );

  }

  onSortChange = (sort) => {
    this.setState({ sort });
  }

  renderSortChoices = () => (this.state.status === 'REQUIRES_ACTION' ? null : (
    <FilterWrapper>
      <span>Sort by </span>
      <DropDownMenu
          placeholder="Name"
          classNamePrefix="lattice-select"
          options={SORT_OPTIONS_ARR}
          onChange={(e) => {
            this.onSortChange(e.value);
          }} />
    </FilterWrapper>
  ))

  renderContent = () => {
    const { loadingResults } = this.props;
    if (loadingResults) {
      return <StyledSectionWrapper>{this.renderSpinner()}</StyledSectionWrapper>;
    }
    return (
      <StyledSectionWrapper>
        <NavButtonToolbar options={NAV_OPTIONS} />
        <StyledSearchWrapper>
          {this.renderError()}
          <Switch>
            <Route path={Routes.SEARCH_FORMS} render={this.renderPersonFilter} />
            <Route path={Routes.REVIEW_REPORTS} render={this.renderTopFilters} />
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
      <FullWidthContainer>
        <StyledFormWrapper>
          {this.renderContent()}
        </StyledFormWrapper>
      </FullWidthContainer>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const review = state.get(STATE.REVIEW);
  return {
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID, ''),

    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_DATE]: review.get(REVIEW.NEIGHBORS_BY_DATE),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.ALL_FILERS]: review.get(REVIEW.ALL_FILERS),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS) || review.get(REVIEW.LOADING_DATA),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR)
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
