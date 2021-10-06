/*
 * @flow
 */

import React from 'react';

// $FlowFixMe
import qs from 'query-string';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { clearSearchResults, searchPeople } from './PersonActions';

import LogoLoader from '../../components/LogoLoader';
import NoSearchResults from '../../components/people/NoSearchResults';
import PersonSearchFields from '../../components/person/PersonSearchFields';
import PersonTable from '../../components/people/PersonTable';
import * as Routes from '../../core/router/Routes';
import { StyledFormViewWrapper, StyledSectionWrapper } from '../../utils/Layout';
import { CONTEXTS, MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { CONTEXT, RCM } from '../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SEARCH } from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { PSA_FORM_DATA } from '../../utils/consts/redux/PSAFormConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';

/*
 * styled components
 */

const Wrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 100%;
`;

const SearchResultsList = styled.div`
  background-color: ${OL.GREY16};
  display: flex;
  flex-direction: column;
  padding: 30px 0;
  width: 100%;

  &:last-child {
    padding-bottom: 0;
  }
`;

const NonResultsContainer = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 50px;
`;

const ListSectionHeader = styled.div`
  font-size: 18px;
  color: ${OL.GREY01};
  padding: 0 0 30px 30px;
`;

const GrayListSectionHeader = styled(ListSectionHeader)`
  padding-top: 30px;
`;

const ErrorMessage = styled.div`
  color: ${OL.RED01};
  font-size: 14px;
  text-align: center;
`;

const CreateButtonWrapper = styled.div`
  background: white;
  border: solid 1px ${OL.GREY11};
  margin: 30px 0;
  padding: 30px;

  button {
    width: 100%;
  }
`;

const SearchResultsWrapper = styled(StyledSectionWrapper)`
  padding: 0;
`;

/*
 * types
 */

type Props = {
  actions :{
    clearSearchResults :() => void;
    searchPeople :RequestSequence;
  };
  error :boolean;
  history :string[];
  isLoadingPeople :boolean;
  onSelectPerson :Function;
  psaForm :Map;
  searchHasRun :boolean;
  searchResults :List;
  selectedOrganizationSettings :Map;
  settings :Map;
}

type State = {
  firstName :string;
  lastName :string;
  dob :?string;
};

class SearchPeopleContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      dob: undefined
    };
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  handleOnSelectPerson = (person :Map, entityKeyId :string, personId :string) => {
    const { onSelectPerson } = this.props;
    onSelectPerson(person, entityKeyId, personId);
  }

  handleOnSubmitSearch = ({ firstName, lastName, dob } :{ firstName :string, lastName :string, dob :string}) => {
    const { actions } = this.props;
    if (firstName.length || lastName.length || dob) {
      actions.searchPeople({ firstName, lastName, dob });
      this.setState({ firstName, lastName, dob });
    }
  }

  createNewPerson = () => {
    const { history, psaForm, settings } = this.props;
    const context = psaForm.get(RCM.COURT_OR_BOOKING, '');
    const psaContext = context === CONTEXT.BOOKING ? CONTEXTS.BOOKING : CONTEXTS.COURT;
    const caseContext = settings.getIn([SETTINGS.CASE_CONTEXTS, psaContext], '');
    const {
      firstName,
      lastName,
      dob
    } = this.state;
    const params = {
      [Routes.LAST_NAME]: lastName,
      [Routes.FIRST_NAME]: firstName,
      [Routes.DOB]: '',
      [Routes.psaContext]: context,
      [Routes.caseContext]: caseContext,
    };
    if (dob) {
      params[Routes.DOB] = dob;
    }

    history.push(`${Routes.NEW_PERSON}?${qs.stringify(params)}`);
  }

  getSortedPeopleList = (peopleList :List, gray :?boolean) => {
    const rows = peopleList.sort((p1 :Map<*, *>, p2 :Map<*, *>) => {
      const p1Last = p1.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
      const p2Last = p2.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
      if (p1Last !== p2Last) return p1Last < p2Last ? -1 : 1;

      const p1First = p1.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
      const p2First = p2.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
      if (p1First !== p2First) return p1First < p2First ? -1 : 1;

      const p1Dob = DateTime.fromISO(p1.getIn([PROPERTY_TYPES.DOB, 0], ''));
      const p2Dob = DateTime.fromISO(p2.getIn([PROPERTY_TYPES.DOB, 0], ''));
      if (p1Dob.isValid && p2Dob.isValid) return p1Dob.valueOf() < p2Dob.valueOf() ? -1 : 1;

      return 0;
    });
    return <PersonTable people={rows} gray={gray} handleSelect={this.handleOnSelectPerson} />;
  }

  renderCreatePersonButton = () => {
    const { searchHasRun } = this.props;
    if (!searchHasRun) {
      return null;
    }

    return (
      <CreateButtonWrapper>
        <Button color="secondary" onClick={this.createNewPerson}>Create Person</Button>
      </CreateButtonWrapper>
    );
  }

  renderSearchResults = () => {

    const {
      isLoadingPeople,
      searchResults,
      searchHasRun,
      selectedOrganizationSettings,
      error
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);

    /* display loading spinner if necessary */
    if (isLoadingPeople) {
      return (
        <NonResultsContainer>
          <LogoLoader loadingText="Loading results..." />
        </NonResultsContainer>
      );
    }

    /* display error message if necessary */
    if (error) {
      return <NonResultsContainer><ErrorMessage>Unable to load search results.</ErrorMessage></NonResultsContainer>;
    }

    /* search has not run and is not currently running -- don't display anything */
    if (!searchHasRun) {
      return null;
    }

    /* search has finished running -- if there are no results, display the NoSearchResults component */
    if (searchResults.isEmpty()) {
      return <NonResultsContainer><NoSearchResults /></NonResultsContainer>;
    }

    /* search has finished running and there are results -- display the results */
    let peopleWithHistory = List();
    let peopleWithoutHistory = List();

    searchResults.forEach((person) => {
      const id = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
      const hasHistory = Number.parseInt(id, 10).toString() === id.toString();
      if (hasHistory) {
        peopleWithHistory = peopleWithHistory.push(person);
      }
      else {
        peopleWithoutHistory = peopleWithoutHistory.push(person);
      }
    });

    return (
      <StyledFormViewWrapper>
        <SearchResultsWrapper>
          <SearchResultsList>
            {
              includesPretrialModule && peopleWithHistory.size ? (
                <div>
                  <ListSectionHeader>People With Case History</ListSectionHeader>
                  { this.getSortedPeopleList(peopleWithHistory) }
                </div>
              ) : null
            }
            {
              peopleWithoutHistory.size ? (
                <div>
                  <GrayListSectionHeader>
                    {
                      includesPretrialModule ? 'People Without Case History' : 'Results'
                    }
                  </GrayListSectionHeader>
                  { this.getSortedPeopleList(peopleWithoutHistory, true) }
                </div>
              ) : null
            }
          </SearchResultsList>
        </SearchResultsWrapper>
      </StyledFormViewWrapper>
    );
  }

  render() {
    return (
      <Wrapper>
        <StyledFormViewWrapper>
          <StyledSectionWrapper>
            <PersonSearchFields includePSAInfo={false} handleSubmit={this.handleOnSubmitSearch} />
          </StyledSectionWrapper>
        </StyledFormViewWrapper>
        { this.renderCreatePersonButton() }
        { this.renderSearchResults() }
      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const psaForm = state.get(STATE.PSA);
  const search = state.get(STATE.SEARCH);
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  // TODO: error is not in SearchReducer
  return {
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    // PSA Form
    [PSA_FORM_DATA.PSA_FORM]: psaForm.get(PSA_FORM_DATA.PSA_FORM),
    // Search
    [SEARCH.SEARCH_RESULTS]: search.get(SEARCH.SEARCH_RESULTS, List()),
    [SEARCH.LOADING]: search.get(SEARCH.LOADING, false),
    [SEARCH.SEARCH_HAS_RUN]: search.get(SEARCH.SEARCH_HAS_RUN),
    error: search.get('searchError', false),
    // Settings
    settings
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Person Actions
    clearSearchResults,
    searchPeople
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchPeopleContainer);
