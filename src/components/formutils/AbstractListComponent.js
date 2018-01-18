import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Button, Col, FormControl } from 'react-bootstrap';

import {
  DeleteButton,
  PaddedRow,
  SectionHeader,
  SectionHeaderSubtitle,
  SubmitWrapper,
  StyledInnerSectionWrapper,
  TableFormControl,
  TableTitleLabel,
  TitleLabel,
  UnpaddedCol,
  UnpaddedRow
} from '../../utils/Layout';
import { LIST_FIELDS } from '../../utils/consts/Consts';
import { getIsLastPage } from '../../utils/Helpers';

const { ID, ENTITY_SET_ID } = LIST_FIELDS

const InputCol = styled(Col)`
  margin: 10px 0;
`;

export default class AbstractListComponent extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      deleteEntityRequest: PropTypes.func.isRequired,
      setInputValue: PropTypes.func.isRequired,
      modifyRow: PropTypes.func.isRequired,
      deleteRow: PropTypes.func.isRequired,
      addRow: PropTypes.func.isRequired
    }).isRequired,
    values: PropTypes.instanceOf(Immutable.Map).isRequired,
    valueList: PropTypes.instanceOf(Immutable.List).isRequired,
    existingValueList: PropTypes.instanceOf(Immutable.List).isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      inputLabel: PropTypes.string.isRequired,
      tableLabel: PropTypes.string.isRequired,
      inputWidth: PropTypes.number.isRequired,
      tableWidth: PropTypes.number.isRequired,
      renderFn: PropTypes.func,
      valueFilterFn: PropTypes.func,
      onChange: PropTypes.func
    })).isRequired,
    header: PropTypes.string
  }

  handleInputChange = (e, optionalFilter) => {
    if (optionalFilter && optionalFilter(e.target.value) && e.target.value.length) return;
    this.props.actions.setInputValue({
      name: e.target.name,
      value: e.target.value
    });
  }

  renderInputField = (field, optionalFilter) => {
    const onChange = (optionalFilter) ? (e) => {
      this.handleInputChange(e, optionalFilter);
    } : this.handleInputChange;
    return (
      <FormControl
          name={field}
          value={this.props.values.get(field)}
          onChange={onChange}
          disabled={getIsLastPage(window.location)} />
    );
  }

  renderRowHeaders = () => {
    const { valueList, existingValueList } = this.props;
    if (!valueList.size && !existingValueList.size) return null;

    const headers = this.props.fields.map((field) => {
      return (
        <Col lg={field.tableWidth} key={field.name}>
          <TableTitleLabel>{field.tableLabel}</TableTitleLabel>
        </Col>
      );
    });

    return (
      <UnpaddedRow>
        <Col lg={1} />
        {headers}
      </UnpaddedRow>
    );
  }

  handleRowUpdate = (e, index) => {
    const { name, value } = e.target;
    this.props.actions.modifyRow(index, name, value);
  }

  renderRow = (row, index, editable, isLastPage) => {
    const deleteFn = editable
      ? () => {
        this.props.actions.deleteRow(index);
      }
      : () => {
        this.props.actions.deleteEntityRequest(row.get(ENTITY_SET_ID), row.get(ID));
      };

    const rows = this.props.fields.map((field) => {
      const { name, tableWidth, valueFilterFn, onChange } = field;

      const updateFn = onChange ? onChange : (e) => {
        if (valueFilterFn && valueFilterFn(e.target.value) && e.target.value.length) return;
        this.handleRowUpdate(e, index);
      };

      const element =  field.renderFn ? field.renderFn(name, row.get(name), updateFn, editable && !isLastPage) : (
        <TableFormControl
            name={name}
            value={row.get(name)}
            onChange={updateFn}
            disabled={isLastPage || !editable} />
      );
      return <UnpaddedCol lg={tableWidth} key={`${index}-${name}`}>{element}</UnpaddedCol>;
    });

    const rowKey = `row-${editable}-${index}`;
    return (
      <UnpaddedRow key={rowKey}>
        <Col lg={1}>
          <DeleteButton
              disabled={isLastPage}
              onClick={deleteFn}>
            <FontAwesome name="close" size="2x" />
          </DeleteButton>
        </Col>
        {rows}
      </UnpaddedRow>
    );
  }

  renderRows = () => {
    const { valueList, existingValueList } = this.props;
    if (!valueList.size && !existingValueList.size) return null;

    const isLastPage = getIsLastPage(window.location);

    const rows = [];
    existingValueList.forEach((row, index) => {
      rows.push(this.renderRow(row, index, false, isLastPage));
    });

    valueList.forEach((row, index) => {
      rows.push(this.renderRow(row, index, true, isLastPage));
    });

    return rows;
  }

  renderInputFields = () => {
    const { fields, values } = this.props;
    const inputFields = fields.map((field) => {
      const { name, inputLabel, inputWidth, valueFilterFn, renderFn, onChange } = field;

      const updateFn = onChange ? onChange : (e) => {
        this.handleInputChange(e, valueFilterFn);
      };
      const element =  renderFn
        ? field.renderFn(name, values.get(name), updateFn, !getIsLastPage(window.location))
        : this.renderInputField(name, valueFilterFn);

      return (
        <InputCol lg={field.inputWidth} key={field.name}>
          <TitleLabel>{field.inputLabel}</TitleLabel>
          {element}
        </InputCol>
      );
    });
    return <PaddedRow>{inputFields}</PaddedRow>
  }

  render() {
    const { header, actions } = this.props;
    const headerElem = header ? <SectionHeader>{header}</SectionHeader> : null;
    return (
      <StyledInnerSectionWrapper>
        {headerElem}

        {this.renderRowHeaders()}
        {this.renderRows()}
        {this.renderInputFields()}

        <PaddedRow>
          <SubmitWrapper>
            <Button onClick={actions.addRow}>Add</Button>
          </SubmitWrapper>
        </PaddedRow>
      </StyledInnerSectionWrapper>
    );
  }
}
