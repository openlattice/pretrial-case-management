/*
 * @flow
 */

import React from 'react';
import FontAwesome from 'react-fontawesome';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Button, Col, FormControl } from 'react-bootstrap';

import {
  DeleteButton,
  PaddedRow,
  SectionHeader,
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

const { ID, ENTITY_SET_ID } = LIST_FIELDS;

const InputCol = styled(Col)`
  margin: 10px 0;
`;

type FilterFunctionType = (value :string) => boolean;

type Props = {
  actions :{
    deleteEntityRequest :(entitySetId :string, entityKeyId :string) => void,
    setInputValue :(attrs :{
      name :string,
      value :string
    }) => void,
    modifyRow :(index :number, name :string, value :string) => void,
    deleteRow :(index :number) => void,
    addRow :(event :Object) => void
  },
  values :Immutable.Map<*, *>,
  valueList :Immutable.List<*>,
  existingValueList :Immutable.List<*>,
  fields :{
    name :string,
    inputLabel :string,
    tableLabel :string,
    inputWidth :number,
    tableWidth :number,
    renderFn? :(name :string, value :string, updateFn :(event :Object) => void, editable :boolean) => void,
    valueFilterFn? :FilterFunctionType,
    onChange? :(event :Object) => void
  }[],
  header? :string
};

export default class AbstractListComponent extends React.Component<Props, *> {

  handleInputChange = (e :Object, optionalFilter :FilterFunctionType) => {
    if (optionalFilter && optionalFilter(e.target.value) && e.target.value.length) return;
    this.props.actions.setInputValue({
      name: e.target.name,
      value: e.target.value
    });
  }

  renderInputField = (field :string, optionalFilter :FilterFunctionType) => {
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

  handleRowUpdate = (e :Object, index :number) => {
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
      const {
        name,
        valueFilterFn,
        renderFn,
        onChange
      } = field;

      const updateFn = onChange ? onChange : (e) => {
        this.handleInputChange(e, valueFilterFn);
      };
      const element = renderFn
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
