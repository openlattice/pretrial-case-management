/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, Set } from 'immutable';

import RemindersTable from './RemindersTable';
import LogoLoader from '../../assets/LogoLoader';
import Pagination from '../Pagination';
import { Count } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';

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

type Props = {
  entities :Map<*, *>,
  appTypeFqn :string,
  neighbors :Map<*, *>,
  remindersWithOpenPSA :Set<*>,
  loading :boolean,
  title :string,
};

const PAGE_SIZE = 10;

class RemindersTableWithPagination extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      start: 0,
    };
  }

  getRemindersList = () => {
    const { entities } = this.props;
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
          onChangePage={page => this.updatePage((page - 1) * PAGE_SIZE)} />
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
          entities={pageOfEntities}
          neighbors={neighbors}
          remindersWithOpenPSA={remindersWithOpenPSA}
          appTypeFqn={appTypeFqn}
          noResults={!entities.size} />
    );
  }

  render() {
    const { title, entities } = this.props;
    return (
      <TableWrapper>
        <ToolbarWrapper>
          <TableTitle>
            <TitleText>
              <span>{ title }</span>
              <Count>{ entities.size }</Count>
            </TitleText>
          </TableTitle>
          { this.renderPagination() }
        </ToolbarWrapper>
        { this.renderReminders() }
      </TableWrapper>
    );
  }
}

export default RemindersTableWithPagination;
