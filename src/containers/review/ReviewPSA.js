/*
 * @flow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment';
import { List, Map, Set } from 'immutable';

import DatePicker from '../../components/datetime/DatePicker';
import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import PSAReviewReportsRowList from './PSAReviewReportsRowList';
import LogoLoader from '../../components/LogoLoader';
import DropDownMenu from '../../components/StyledSelect';
import { FullWidthContainer, NoResults } from '../../utils/Layout';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { REVIEW, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  DATE_FORMAT,
  FILTER_TYPE,
  STATUS_OPTIONS,
  STATUS_OPTIONS_ARR,
  DOMAIN_OPTIONS_ARR,
  SORT_OPTIONS_ARR,
  NAV_OPTIONS
} from '../../utils/consts/ReviewPSAConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as Routes from '../../core/router/Routes';

const { PEOPLE, STAFF } = APP_TYPES;

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
  justify-content: ${props => (props.includesPretrialModule ? 'space-between' : 'flex-start')};
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

type Props = {
  history :string[],
  scoresAsMap :Map<*, *>,
  selectedOrganizationSettings :Map<*, *>,
  psaNeighborsByDate :Map<*, Map<*, *>>,
  loadingResults :boolean,
  errorMessage :string,
  location :Object,
  actions :{
    loadPSAsByDate :(filter :string) => void
  },
  psaNeighborsById :Map<*, *>,
  allFilers :Set<*>,
  selectedOrganizationId :string
}

type State = {
  filterType :string,
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
      options: List(),
      filterType: FILTER_TYPE.VIEW_ALL,
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
      actions.checkPSAPermissions();
    }
  }

  componentDidUpdate(prevProps) {
    const { status } = this.state;
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.loadPSAsByDate(STATUS_OPTIONS[status].value);
      actions.checkPSAPermissions();
    }
  }

  switchToViewAll = () => {
    const { psaNeighborsByDate } = this.props;
    this.setState({
      filterType: FILTER_TYPE.VIEW_ALL,
      options: psaNeighborsByDate
    });
  };
  switchToSearch = () => {
    const { psaNeighborsById } = this.props;
    this.setState({
      filterType: FILTER_TYPE.SEARCH,
      options: psaNeighborsById
    });
  };

  componentWillReceiveProps(nextProps) {
    const { psaNeighborsByDate, psaNeighborsById } = nextProps;
    const { location } = nextProps;
    const path = location.pathname;
    const pathsDoNotMatch = path !== this.props.location.pathname;
    if (pathsDoNotMatch && path.endsWith(Routes.REVIEW_REPORTS)) {
      this.resetState(FILTER_TYPE.VIEW_ALL, moment());
      this.switchToViewAll();
    }
    else if (pathsDoNotMatch && path.endsWith(Routes.SEARCH_FORMS)) {
      this.resetState(FILTER_TYPE.SEARCH, '');
      this.switchToSearch();
    }
    if (psaNeighborsByDate.size && path.endsWith(Routes.REVIEW_REPORTS)) {
      this.switchToViewAll();
      this.setState({ options: psaNeighborsByDate });
    }
    if (psaNeighborsById.size && path.endsWith(Routes.SEARCH_FORMS)) {
      this.setState({ options: psaNeighborsByDate });
      this.switchToSearch();
    }
    this.handleFilterRequest();
  }

  resetState = (filterType, date) => {
    this.setState(
      {
        filterType,
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
  }

  updateFilters = (newFilters :Object) => {
    let { filters } = this.state;
    const existingFilters = filters;
    filters = Object.assign({}, existingFilters, newFilters);
    this.setState({ filters });
    this.handleFilterRequest();
  }

  renderDateRangePicker = () => {
    const { filters } = this.state;
    const { date } = filters;

    return (
      <DateRangeContainer>
        <span>PSA Date </span>
        <DatePickerGroupContainer>
          <DatePicker
              subtle
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
      <LogoLoader loadingText="Loading past reports..." />
    </div>
  )

  onInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleFilterRequest = () => {
    const { filterType, filters } = this.state;
    const { filer } = filters;
    const { scoresAsMap } = this.props;
    const { sort } = this.state;

    let items = null;

    if (filterType === FILTER_TYPE.VIEW_ALL) {
      items = this.filterByDate();
    }
    else if (filterType === FILTER_TYPE.SEARCH) {
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
          filterType={filterType}
          renderContent={this.renderBottomFilters}
          component={CONTENT_CONSTS.REVIEW} />
    );
  }

  renderError = () => <ErrorText>{this.props.errorMessage}</ErrorText>


  filterWithoutDate = () => {
    const { psaNeighborsByDate } = this.props;
    let results = Map();
    const keys = psaNeighborsByDate.keySeq();

    keys.forEach((date) => {
      results = results.merge(psaNeighborsByDate.get(date, Map())
        .entrySeq()
        .filter(([scoreId, neighbors]) => {

          if (!this.domainMatch(neighbors)) return false;

          const personId = neighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]);
          if (personId) return true;
        }));
    });
    return results.entrySeq();
  }

  domainMatch = neighbors => (
    !this.state.domain.length
      || neighbors.get(STAFF, List()).filter((neighbor) => {
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
      neighbors.get(STAFF, List()).forEach((neighbor) => {
        if (neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID], List()).includes(filer)) {
          includesFiler = true;
        }
      });
      return includesFiler;
    });
  }

  renderPersonFilter = () => {
    const { filters } = this.state;
    const handleSubmit = ({ firstName, lastName, dob }) => {
      this.setState({ filterType: FILTER_TYPE.SEARCH });
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
    const { scoresAsMap } = this.props;
    const { filters, options, status } = this.state;
    const { firstName, lastName, dob } = filters;
    if (!firstName.length && !lastName.length) return List();
    const notAllStatus = status !== 'ALL';

    const personResults = options.entrySeq().filter(([scoreId, neighbors]) => {
      if (!this.domainMatch(neighbors)) return false;

      const matchesFilter = !!scoresAsMap.get(scoreId);
      if (notAllStatus && !matchesFilter) return false;

      const neighborFirst = neighbors.getIn(
        [PEOPLE, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.FIRST_NAME],
        List()
      );
      const neighborLast = neighbors.getIn(
        [PEOPLE, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.LAST_NAME],
        List()
      );
      const neighborDob = neighbors.getIn(
        [PEOPLE, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.DOB],
        List()
      );

      if (!neighborFirst.filter(val => val.toLowerCase().includes(firstName.toLowerCase())).size) return false;
      if (!neighborLast.filter(val => val.toLowerCase().includes(lastName.toLowerCase())).size) return false;
      if (dob && dob.length
        && !neighborDob.filter(val => val.toLowerCase().includes(dob.split('T')[0])).size) return false;

      return true;
    });

    return personResults;
  }

  filterByDate = () => {
    const { filters, options } = this.state;
    const date = moment(filters.date).format(DATE_FORMAT);

    if (filters.date === '' || !filters.date) {
      return this.filterWithoutDate();
    }

    return options.get(date, Map())
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

  renderStatusOptions = () => {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    return includesPretrialModule
      ? (
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
      ) : null;
  }

  changeDomain = (domain) => {
    this.setState({ domain });
  }

  renderDomainChoices = () => {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);

    return includesPretrialModule
      ? (
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
      ) : null;
  }

  renderTopFilters = () => {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    return (
      <StyledFiltersBar includesPretrialModule={includesPretrialModule}>
        {this.renderDateRangePicker()}
        {this.renderStatusOptions()}
        {this.renderDomainChoices()}
        {this.renderFilerOptions()}
      </StyledFiltersBar>
    );
  };

  renderBottomFilters = () => {
    const { filterType } = this.state;
    if (filterType === FILTER_TYPE.VIEW_ALL) {
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
    const { loadingResults, selectedOrganizationId } = this.props;
    if (!selectedOrganizationId || loadingResults) {
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
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID, ''),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS, ''),

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
