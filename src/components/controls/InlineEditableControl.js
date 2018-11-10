/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { faCheck, faPencil } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../utils/consts/Colors';
import { isNonEmptyString } from '../../utils/LangUtils';

const ControlWrapper = styled.div`
  display: inline-flex;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const EditableControlWrapper = styled(ControlWrapper)`
  &:hover {
    cursor: pointer;
    .control {
      border: 1px solid ${OL.GREY19};
    }
    .icon {
      visibility: visible;
    }
  }
`;

const Icon = styled.div`
  border-style: solid;
  border-width: 1px;
  height: 32px;
  width: 32px;
  margin-left: 10px;
  font-size: 14px;
  padding: 0;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
`;

const EditIcon = styled(Icon)`
  background-color: ${OL.WHITE};
  border-color: ${OL.GREY19};
  visibility: hidden;
`;

const SaveIcon = styled(Icon)`
  background-color: ${OL.PURPLE12};
  border-color: ${OL.PURPLE12};
  color: ${OL.WHITE};
  visibility: visible;
`;

const TextControl = styled.div`
  border: 1px solid transparent;
  position: relative;
  font-size: ${props => props.styleMap.fontSize};
  line-height: ${props => props.styleMap.lineHeight};
  margin: ${props => props.styleMap.margin};
  padding: ${props => props.styleMap.padding};
`;

const TextInputControl = styled.input`
  border: 1px solid ${OL.PURPLE12};
  margin: 0;
  width: 100%;
  font-size: ${props => props.styleMap.inputFontSize};
  line-height: ${props => props.styleMap.lineHeight};
  margin: ${props => props.styleMap.margin};
  padding: ${props => props.styleMap.padding};
  &:focus {
    outline: none;
  }
`;

const TextAreaControl = styled.textarea`
  border: 1px solid ${OL.PURPLE12};
  margin: 0;
  min-height: 100px;
  width: 100%;
  font-size: ${props => props.styleMap.inputFontSize};
  height: ${props => (props.styleMap.height ? props.styleMap.height : 'auto')};
  line-height: ${props => props.styleMap.lineHeight};
  margin: ${props => props.styleMap.margin};
  padding: ${props => props.styleMap.padding};
  &:focus {
    outline: none;
  }
`;

const TYPES = {
  TEXT: 'text',
  TEXT_AREA: 'textarea'
};

/*
 * the negative margin-left is to adjust for the padding + border offset
 */
const STYLE_MAP = {
  small: {
    fontSize: '14px',
    inputFontSize: '13px',
    lineHeight: '16px',
    margin: '0 0 0 -13px',
    padding: '6px 12px'
  },
  medium_small: {
    fontSize: '16px',
    inputFontSize: '14px',
    lineHeight: '18px',
    margin: '0 0 0 -13px',
    padding: '8px 12px'
  },
  medium: {
    fontSize: '20px',
    inputFontSize: '18px',
    lineHeight: '24px',
    margin: '0 0 0 -13px',
    padding: '8px 12px'
  },
  xlarge: {
    fontSize: '32px',
    inputFontSize: '30px',
    lineHeight: '36px',
    margin: '0 0 0 -13px',
    padding: '10px 12px'
  }
};

/*
 * TODO: explore how to handle children. for example, there's a use case where the non-edit view could display
 *       a Badge inside TextControl
 */

type Props = {
  type :string,
  size :string,
  placeholder? :string,
  value? :string,
  viewOnly? :boolean,
  onChange? :(newVal :string) => void,
  onChangeConfirm? :(newVal :string) => Promise<void>
};

type State = {
  editable :boolean,
  currentValue :string,
  previousValue :string
};

export default class InlineEditableControl extends React.Component<Props, State> {

  static defaultProps = {
    placeholder: 'Click to edit...',
    value: '',
    viewOnly: false,
    onChange: () => {},
    onChangeConfirm: undefined
  };

  control :any

  constructor(props :Props) {

    super(props);
    const { value } = this.props;
    const initialValue = isNonEmptyString(value) ? value : '';
    const initializeAsEditable = !isNonEmptyString(initialValue);

    this.control = null;

    this.state = {
      editable: initializeAsEditable,
      currentValue: initialValue,
      previousValue: initialValue
    };
  }

  componentDidUpdate(prevProps :Object, prevState :Object) {
    const { onChangeConfirm, onChange } = this.props;
    const { editable, currentValue } = this.state;
    if (this.control
        && prevState.editable === false
        && editable === true) {
      // BUG: if there's multiple InlineEditableControl components on the page, the focus might not be on the desired
      // element. perhaps need to take in a prop to indicate focus
      this.control.focus();
    }

    // going from editable to not editable should invoke the onChange callback only if the value actually changed
    if (prevState.previousValue !== currentValue
        && prevState.editable === true
        && editable === false) {
      if (onChangeConfirm) {
        onChangeConfirm(currentValue)
          .then((success) => {
            if (!success) {
              this.setState({
                currentValue: prevState.previousValue,
                previousValue: ''
              });
            }
          });
      }
      else {
        onChange(currentValue);
      }
    }
  }

  componentWillReceiveProps(nextProps :Object) {
    const { value } = this.props;
    if (value !== nextProps.value) {
      const newValue = isNonEmptyString(nextProps.value) ? nextProps.value : '';
      const initializeAsEditable = !isNonEmptyString(newValue);
      this.setState({
        editable: initializeAsEditable,
        currentValue: newValue,
        previousValue: newValue
      });
    }
  }

  toggleEditable = () => {
    const { viewOnly } = this.props;
    const { currentValue, editable } = this.state;
    if (viewOnly) {
      return;
    }

    if (!isNonEmptyString(currentValue)) {
      return;
    }

    this.setState({
      editable: !editable,
      previousValue: currentValue
    });
  }

  handleOnBlur = () => {

    this.toggleEditable();
  }

  handleOnChange = (event :SyntheticInputEvent) => {

    this.setState({
      currentValue: event.target.value
    });
  }

  handleOnKeyDown = (event :SyntheticKeyboardEvent) => {

    switch (event.keyCode) {
      case 13: // 'Enter' key code
      case 27: // 'Esc' key code
        this.toggleEditable();
        break;
      default:
        break;
    }
  }

  getPlaceholder = () => {
    const { viewOnly, placeholder } = this.props;
    return viewOnly ? '' : placeholder;
  }

  renderTextControl = () => {
    const { viewOnly, size } = this.props;
    const { currentValue, editable } = this.state;
    if (!viewOnly && editable) {
      return (
        <TextInputControl
            styleMap={STYLE_MAP[size]}
            placeholder={this.getPlaceholder()}
            value={currentValue}
            onBlur={this.handleOnBlur}
            onChange={this.handleOnChange}
            onKeyDown={this.handleOnKeyDown}
            innerRef={(element) => {
              this.control = element;
            }} />
      );
    }

    return (
      <TextControl
          className="control"
          styleMap={STYLE_MAP[size]}
          onClick={this.toggleEditable}
          innerRef={(element) => {
            this.control = element;
          }}>
        {
          isNonEmptyString(currentValue)
            ? currentValue
            : this.getPlaceholder()
        }
      </TextControl>
    );
  }

  renderTextAreaControl = () => {
    const { viewOnly, size } = this.props;
    const { currentValue, editable } = this.state;
    if (!viewOnly && editable) {
      if (this.control) {
        // +2 1px border
        STYLE_MAP[size].height = `${Math.ceil(this.control.clientHeight) + 2}px`;
      }
      return (
        <TextAreaControl
            styleMap={STYLE_MAP[size]}
            placeholder={this.getPlaceholder()}
            value={currentValue}
            onBlur={this.handleOnBlur}
            onChange={this.handleOnChange}
            onKeyDown={this.handleOnKeyDown}
            innerRef={(element) => {
              this.control = element;
            }} />
      );
    }

    return (
      <TextControl
          className="control"
          styleMap={STYLE_MAP[size]}
          onClick={this.toggleEditable}
          innerRef={(element) => {
            this.control = element;
          }}>
        {
          isNonEmptyString(currentValue)
            ? currentValue
            : this.getPlaceholder()
        }
      </TextControl>
    );
  };

  getControl = () => {
    const { type } = this.props;
    switch (type) {
      case TYPES.TEXT:
        return this.renderTextControl();
      case TYPES.TEXT_AREA:
        return this.renderTextAreaControl();
      default:
        return this.renderTextControl();
    }
  }

  getEditButton = () => {
    const { viewOnly } = this.props;
    const { editable } = this.state;
    if (!viewOnly && editable) {
      return (
        <SaveIcon className="icon" onClick={this.toggleEditable}>
          <FontAwesomeIcon icon={faCheck} />
        </SaveIcon>
      );
    }

    return (
      <EditIcon className="icon" onClick={this.toggleEditable}>
        <FontAwesomeIcon icon={faPencil} />
      </EditIcon>
    );
  }

  render() {
    const { viewOnly } = this.props;
    const control = this.getControl();
    const editButton = this.getEditButton();

    if (viewOnly) {
      return (
        <ControlWrapper>
          { control }
        </ControlWrapper>
      );
    }

    return (
      <EditableControlWrapper>
        { control }
        { editButton }
      </EditableControlWrapper>
    );
  }
}
