/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { DateTime } from 'luxon';
import { List, Map, Set } from 'immutable';
import { DatePicker, Select } from 'lattice-ui-kit';

import NavButtonToolbar from '../../components/buttons/NavButtonToolbar';
import PSAReviewReportsRowList from './PSAReviewReportsRowList';
import LogoLoader from '../../components/LogoLoader';
import { FullWidthContainer, NoResults } from '../../utils/Layout';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
import { OL } from '../../utils/consts/Colors';
import { formatDate } from '../../utils/FormattingUtils';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { REVIEW, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  FILTER_TYPE,
  STATUS_OPTIONS,
  STATUS_OPTIONS_ARR,
  SORT_OPTIONS_ARR,
  NAV_OPTIONS
} from '../../utils/consts/ReviewPSAConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';


import * as Routes from '../../core/router/Routes';
import { checkPSAPermissions, loadPSAsByDate } from './ReviewActions';

const { PEOPLE, STAFF } = APP_TYPES;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledSectionWrapper = styled.div`
  color: ${OL.GREY01};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledSearchWrapper = styled.div`
  width: 100%;
`;

const StyledTopFormNavBuffer = styled.div`
  height: 55px;
`;

const SelectWrapper = styled.div`
  width: 175px;
`;

const StyledFiltersBar = styled.div`
  background: white;
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
  padding: 0 30px;
  font-size: 14px;
  text-align: center;
  display: grid;
  grid-template-columns: repeat(3, 250px);
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  width: 100%;

  span {
    margin: 10px;
  }
`;

const PersonSearchWrapper = styled.div`
  width: 100%;
  background: white;
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
  display: grid;
  grid-template-columns: repeat(3, 250px);
  white-space: nowrap;
  margin-top: 10px;
`;

const DatePickerGroupContainer = styled.div`
  width: 100%;
  max-width: 175px;
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
  actions :{
    checkPSAPermissions :RequestSequence;
    loadPSAsByDate :RequestSequence;
  };
  allFilers :Set;
  errorMessage :string;
  loadingResults :boolean;
  location :Object;
  psaNeighborsByDate :Map;
  psaNeighborsById :Map;
  scoresAsMap :Map;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
}

type State = {
  filterType :string;
  filters :{
    date :string;
    firstName :string;
    lastName :string;
    dob :string;
    filer :string;
  };
  options :List;
  sort :string;
  status :string;
};

class ReviewPSA extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      options: List(),
      filterType: FILTER_TYPE.VIEW_ALL,
      filters: {
        date: formatDate(DateTime.local().toISO()),
        firstName: '',
        lastName: '',
        dob: '',
        filer: '',
        searchExecuted: false
      },
      sort: SORT_TYPES.NAME,
      status: 'OPEN',
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

  componentDidUpdate(prevProps :Props) {
    const { status } = this.state;
    const {
      loadingResults,
      actions,
      location,
      psaNeighborsByDate,
      psaNeighborsById,
      selectedOrganizationId
    } = this.props;
    const path = location.pathname;
    const pathsDoNotMatch = path !== prevProps.location.pathname;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.loadPSAsByDate(STATUS_OPTIONS[status].value);
      actions.checkPSAPermissions();
    }
    if (
      psaNeighborsByDate.size
        && !loadingResults
        && prevProps.loadingResults
        && path.endsWith(Routes.REVIEW_REPORTS)
    ) {
      this.setState({ options: psaNeighborsByDate });
    }
    if (
      psaNeighborsByDate.size
        && !loadingResults
        && prevProps.loadingResults
        && path.endsWith(Routes.SEARCH_FORMS)
    ) {
      this.setState({ options: psaNeighborsById });
    }
    if (pathsDoNotMatch && path.endsWith(Routes.REVIEW_REPORTS)) {
      this.resetState(FILTER_TYPE.VIEW_ALL, formatDate(DateTime.local().toISODate()));
      this.switchToViewAll();
      this.setState({ options: psaNeighborsByDate });
    }
    else if (pathsDoNotMatch && path.endsWith(Routes.SEARCH_FORMS)) {
      this.resetState(FILTER_TYPE.SEARCH, '');
      this.switchToSearch();
      this.setState({ options: psaNeighborsById });

    }
    this.handleFilterRequest();
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

  resetState = (filterType :string, date :string) => {
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
    filters = { ...existingFilters, ...newFilters };
    this.setState({ filters });
    this.handleFilterRequest();
  }

  setDate = (newDate :string) => {
    const date = newDate ? formatDate(DateTime.fromISO(newDate)) : '';
    this.updateFilters({ date });
  }

  renderDateRangePicker = () => {
    const { filters } = this.state;
    const { date } = filters;
    const isoDate = date.length ? DateTime.fromFormat(date, DATE_FORMAT).toISODate() : null;

    return (
      <FilterWrapper>
        <span>PSA Date </span>
        <DatePickerGroupContainer>
          <DatePicker
              value={isoDate}
              onChange={this.setDate} />
        </DatePickerGroupContainer>
      </FilterWrapper>
    );
  }

  renderFilerOptions = () => {
    let { allFilers } = this.props;
    allFilers = allFilers.toArray().map((filer) => (
      {
        value: filer,
        label: filer
      }
    ));
    const filerOptions = [{ value: '', label: 'All' }].concat(allFilers);
    return (
      <FilterWrapper>
        <span>Filer </span>
        <SelectWrapper>
          <Select
              placeholder="All"
              onChange={(e) => this.updateFilters({ filer: e.value })}
              options={filerOptions} />
        </SelectWrapper>
      </FilterWrapper>
    );
  }

  renderSpinner = () => (
    <div>
      <LogoLoader loadingText="Loading past reports..." />
    </div>
  )

  onInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
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

  renderError = () => {
    const { errorMessage } = this.props;
    return <ErrorText>{errorMessage}</ErrorText>;
  }


  filterWithoutDate = () => {
    const { psaNeighborsByDate } = this.props;
    let results = Map();
    const keys = psaNeighborsByDate.keySeq();

    keys.forEach((date) => {
      results = results.merge(psaNeighborsByDate.get(date, Map())
        .entrySeq()
        .filter(([_, neighbors]) => {
          const personId = neighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]);
          if (personId) return true;
          return false;
        }));
    });
    return results.entrySeq();
  }

  filterByFiler = (items :Map) => {
    const { filters } = this.state;
    const { filer } = filters;

    return items.filter(([_, neighbors]) => {
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
    if (!firstName.length && !lastName.length && !dob.length) return List();
    const notAllStatus = status !== 'ALL';
    const formatteDOB = DateTime.fromFormat(dob, DATE_FORMAT).toISODate();

    const personResults = options.entrySeq().filter(([scoreId, neighbors]) => {

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

      if (!neighborFirst.filter((val) => val.toLowerCase().includes(firstName.toLowerCase())).size) return false;
      if (!neighborLast.filter((val) => val.toLowerCase().includes(lastName.toLowerCase())).size) return false;
      if (formatteDOB && formatteDOB.length
        && !neighborDob.filter((val) => val.includes(formatteDOB)).size) return false;

      return true;
    });

    return personResults;
  }

  filterByDate = () => {
    const { filters, options } = this.state;
    const { date } = filters;

    if (filters.date === '' || !filters.date) {
      return this.filterWithoutDate();
    }

    return options.get(date, Map())
      .entrySeq();
  }

  changeStatus = (nextStatus :string) => {
    const { actions } = this.props;
    const { status } = this.state;
    if (nextStatus !== status) {
      this.setState({ status: nextStatus });
      actions.loadPSAsByDate(STATUS_OPTIONS[nextStatus].value);
    }
  }

  renderStatusOptions = () => {
    const { status } = this.state;
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    return includesPretrialModule
      ? (
        <FilterWrapper>
          <span>PSA Status </span>
          <SelectWrapper>
            <Select
                placeholder={STATUS_OPTIONS[status].label}
                options={STATUS_OPTIONS_ARR}
                onChange={(e) => this.changeStatus(e.value)} />
          </SelectWrapper>
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
        {this.renderFilerOptions()}
        {this.renderSortChoices()}
      </BottomFiltersWrapper>
    );

  }

  onSortChange = (sortOption :Object) => {
    const { value: sort } = sortOption;
    this.setState({ sort });
  }

  renderSortChoices = () => {
    const { status, sort } = this.state;
    return (status === 'REQUIRES_ACTION')
      ? null
      : (
        <FilterWrapper>
          <span>Sort by </span>
          <SelectWrapper>
            <Select
                placeholder={sort}
                options={SORT_OPTIONS_ARR}
                onChange={this.onSortChange} />
          </SelectWrapper>
        </FilterWrapper>
      );
  }

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
    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
    [REVIEW.ALL_FILERS]: review.get(REVIEW.ALL_FILERS),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS) || review.get(REVIEW.LOADING_DATA),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR)
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Review Actions
    loadPSAsByDate,
    checkPSAPermissions
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ReviewPSA);
