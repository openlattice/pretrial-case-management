/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, Set } from 'immutable';

import RemindersTable from './RemindersTable';
import LogoLoader from '../LogoLoader';
import BasicButton from '../buttons/BasicButton';
import Pagination from '../Pagination';
import { Count } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { sortEntities } from '../../utils/RemindersUtils';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';

const { REMINDER_OPT_OUTS } = APP_TYPES;

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const TableWrapper = styled.div`
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
  margin-bottom: 15px;
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  overflow: hidden;
`;

const TableTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
  padding-bottom: 20px;
  min-height: 56px;
`;

const TitleText = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
`;

const FilterButton = styled(BasicButton)`
  border-radius: 30px;
  border: 1px solid ${OL.GREY11};
  margin: 0 5px;
  padding: 0 20px;
  background: ${(props) => (props.selected ? OL.PURPLE02 : 'none')};
  color: ${(props) => (props.selected ? OL.WHITE : OL.GREY02)};
`;
const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: max-content;
  justify-content: space-around;
`;

type Props = {
  appTypeFqn :string;
  entities :Map;
  filter :string;
  filters :Map;
  loading :boolean;
  neighbors :Map;
  remindersWithOpenPSA :Set;
  selectFilterFn :() => void;
  title :string;
};

const PAGE_SIZE = 10;

class RemindersTableWithPagination extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      start: 0,
      sort: SORT_TYPES.NAME
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { loading } = nextProps;
    if (loading) {
      return { start: 0 };
    }
    return null;
  }

  sortByDate = () => this.setState({ sort: SORT_TYPES.DATE });
  sortByName = () => this.setState({ sort: SORT_TYPES.NAME });
  sortByCaseNumber = () => this.setState({ sort: SORT_TYPES.CASE_NUM });

  getSortedEntities = () => {
    const { sort } = this.state;
    const { appTypeFqn, entities, neighbors } = this.props;
    const shouldSortByDateTime = (appTypeFqn === REMINDER_OPT_OUTS);
    return sortEntities(entities, neighbors, shouldSortByDateTime, sort);
  }

  getRemindersList = () => {
    const entities = this.getSortedEntities();
    const numResults = entities.size;
    const numPages = Math.ceil(numResults / PAGE_SIZE);
    return { entities, numResults, numPages };
  }

  updatePage = (start) => {
    this.setState({ start });
  }

  renderPagination = () => {
    const { start } = this.state;
    const { numPages } = this.getRemindersList();
    const currPage = (start / PAGE_SIZE) + 1;
    return (
      <Pagination
          numPages={numPages}
          activePage={currPage}
          onChangePage={(page) => this.updatePage((page - 1) * PAGE_SIZE)} />
    );
  }

  renderReminders = () => {
    const { start } = this.state;
    const {
      appTypeFqn,
      neighbors,
      remindersWithOpenPSA,
      loading
    } = this.props;
    const { entities } = this.getRemindersList();
    const pageOfEntities = entities.slice(start, start + PAGE_SIZE);
    if (loading) return <LogoLoader loadingText="Loading..." />;
    return (
      <RemindersTable
          sortByName={this.sortByName}
          sortByDate={this.sortByDate}
          sortByCaseNumber={this.sortByCaseNumber}
          entities={pageOfEntities}
          neighbors={neighbors}
          remindersWithOpenPSA={remindersWithOpenPSA}
          appTypeFqn={appTypeFqn}
          noResults={!entities.size} />
    );
  }

  renderFilterButtons = () => {
    const { filter, filters, selectFilterFn } = this.props;
    const buttons = filters.valueSeq().map((buttonFilter) => {
      const label = buttonFilter.get('label', <div />);
      const value = buttonFilter.get('value', '');
      const selected = filter === value;
      return (
        <FilterButton
            key={value}
            selected={selected}
            value={value}
            onClick={selectFilterFn}>
          { label }
        </FilterButton>
      );
    });
    const FilterButtons = (
      <ButtonWrapper>
        { buttons.toJS() }
      </ButtonWrapper>
    );
    return FilterButtons;
  }

  render() {
    const { title, entities, filters } = this.props;
    return (
      <TableWrapper>
        <ToolbarWrapper>
          <TableTitle>
            <TitleText>
              <span>{ title }</span>
              <Count>{ entities.size }</Count>
            </TitleText>
            { filters ? this.renderFilterButtons() : null }
          </TableTitle>
          { this.renderPagination() }
        </ToolbarWrapper>
        { this.renderReminders() }
      </TableWrapper>
    );
  }
}

export default RemindersTableWithPagination;
