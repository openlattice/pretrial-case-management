/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable, { Map, fromJS } from 'immutable';
import { connect } from 'react-redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { bindActionCreators } from 'redux';

import RadioButton from '../controls/StyledRadioButton';
import Checkbox from '../controls/StyledCheckbox';
import StyledInput from '../controls/StyledInput';
import InfoButton from '../buttons/InfoButton';
import closeX from '../../assets/svg/close-x-gray.svg';
import { CenteredContainer } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES, PSA_FAILURE_REASONS } from '../../utils/consts/Consts';
import { getEntityKeyId, stripIdField } from '../../utils/DataUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as FormActionFactory from '../../containers/psa/FormActionFactory';
import * as ReviewActionFactory from '../../containers/review/ReviewActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';

const ModalWrapper = styled(CenteredContainer)`
  margin-top: -15px;
  padding: 15px;
  width: 100%;
  color: ${OL.GREY01};
  font-family: 'Open Sans', sans-serif;
  justify-content: center;
  h1, h2, h3 {
    width: 100%;
    text-align: left;
  }
  h1 {
    font-size: 18px;
    margin: 30px 0;
  }
  h2 {
    font-size: 16px;
    margin: 20px 0;
  }
  h3 {
    font-size: 14px;
    margin: 10px 0;
  }
`;

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SubmitButton = styled(InfoButton)`
  width: 340px;
  height: 43px;
  margin-top: 30px;
`;

const CloseModalX = styled.img.attrs({
  alt: '',
  src: closeX
})`
  height: 16px;
  width: 16px;
  margin-left: 40px;

  &:hover {
    cursor: pointer;
  }
`;

const StatusNotes = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RadioWrapper = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => (`repeat(${props.numColumns}, 1fr)`)};
  grid-gap: ${props => (`${props.gap}px`)};
`;

const FailureReasonsWrapper = styled.div`
  font-size: 16px;
  text-align: left;
  color: ${OL.GREY01};
`;

type Props = {
  app :Map<*, *>,
  open :boolean,
  scores :Immutable.Map<*, *>,
  selectedOrganizationSettings :Immutable.Map<*, *>,
  onClose :() => void,
  defaultStatus? :?string,
  entityKeyId :?string,
  defaultFailureReasons? :string[],
  defaultStatusNotes? :?string,
  onSubmit :() => void,
  onStatusChangeCallback :() => void,
  actions :{
    clearSubmit :() => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    changePSAStatus :(values :{
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>
    }) => void
  }
};

type State = {
  status :?string,
  failureReason :string[],
  statusNotes :?string
};

class ClosePSAModal extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      status: props.defaultStatus,
      failureReason: props.defaultFailureReasons,
      statusNotes: props.defaultStatusNotes
    };
  }

  static defaultProps = {
    defaultStatus: '',
    defaultFailureReasons: [],
    defaultStatusNotes: ''
  }

  mapOptionsToRadioButtons = (options :{}, field :string) => Object.values(options).map(option => (
    <RadioWrapper key={option}>
      <RadioButton
          name={field}
          value={option}
          checked={this.state[field] === option}
          onChange={this.onStatusChange}
          disabled={this.state.disabled}
          label={option} />
    </RadioWrapper>
  ))

  mapOptionsToCheckboxes = (options :{}, field :string) => Object.values(options).map(option => (
    <RadioWrapper key={option}>
      <Checkbox
          name={field}
          value={option}
          checked={this.state[field].includes(option)}
          onChange={this.handleCheckboxChange}
          disabled={this.state.disabled}
          label={option} />
    </RadioWrapper>
  ))


  onStatusChange = (e) => {
    const { status } = this.state;
    const { name, value } = e.target;
    const failureReason = status !== PSA_STATUSES.FAILURE ? [] : this.state.failureReason;
    const state :State = Object.assign({}, this.state, {
      [name]: value,
      failureReason
    });
    this.setState(state);
  }

  handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const values = this.state[name];

    if (checked && !values.includes(value)) {
      values.push(value);
    }
    if (!checked && values.includes(value)) {
      values.splice(values.indexOf(value), 1);
    }

    this.setState({ [name]: values });
  }

  onStatusNotesChange = (e) => {
    this.setState({ statusNotes: e.target.value });
  }

  isReadyToSubmit = () => {
    const { status, failureReason } = this.state;
    let isReady = !!status;
    if (status === PSA_STATUSES.FAILURE && !failureReason.length) {
      isReady = false;
    }
    return isReady;
  }

  handleStatusChange = (app :Map<*, *>, status :string, failureReason :string[], statusNotes :?string) => {
    const {
      actions,
      scores,
      onStatusChangeCallback,
      onSubmit,
      entityKeyId
    } = this.props;
    if (!actions.changePSAStatus) return;
    const statusNotesList = (statusNotes && statusNotes.length) ? Immutable.List.of(statusNotes) : Immutable.List();
    const psaEKID = getEntityKeyId(scores);

    const scoresEntity = stripIdField(scores
      .set(PROPERTY_TYPES.STATUS, Immutable.List.of(status))
      .set(PROPERTY_TYPES.FAILURE_REASON, Immutable.fromJS(failureReason))
      .set(PROPERTY_TYPES.STATUS_NOTES, statusNotesList));
    actions.changePSAStatus({
      scoresId: entityKeyId,
      scoresEntity,
      callback: onStatusChangeCallback
    });

    actions.editPSA({ psaEKID });
    onSubmit();
    this.setState({ editing: false });
  }

  submit = () => {
    const { app, onClose } = this.props;
    const { status, failureReason } = this.state;
    let { statusNotes } = this.state;
    if (!status) return;
    if (!statusNotes || !statusNotes.length) {
      statusNotes = null;
    }

    this.handleStatusChange(app, status, failureReason, statusNotes);
    onClose();
  }

  render() {
    const { open, onClose, selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const { status, statusNotes } = this.state;
    return (
      <ModalTransition>
        { open
          && (
            <Modal
                onClose={() => onClose()}
                shouldCloseOnOverlayClick
                stackIndex={2}
                scrollBehavior="outside">
              <ModalWrapper>
                <TitleWrapper>
                  <h1>Select PSA Resolution</h1>
                  <CloseModalX onClick={() => onClose()} />
                </TitleWrapper>
                <OptionsGrid numColumns={includesPretrialModule ? 3 : 2} gap={5}>
                  {
                    includesPretrialModule
                      ? this.mapOptionsToRadioButtons(PSA_STATUSES, 'status')
                      : this.mapOptionsToRadioButtons(
                        fromJS(PSA_STATUSES)
                          .filter(value => value === PSA_STATUSES.OPEN || value === PSA_STATUSES.CANCELLED)
                          .toJS(),
                        'status'
                      )
                  }
                </OptionsGrid>
                { status === PSA_STATUSES.FAILURE
                  ? (
                    <FailureReasonsWrapper>
                      <h2>Reason(s) for failure</h2>
                      <OptionsGrid numColumns={2} gap={10}>
                        {this.mapOptionsToCheckboxes(PSA_FAILURE_REASONS, 'failureReason')}
                      </OptionsGrid>
                    </FailureReasonsWrapper>
                  )
                  : null
                }
                <h3>Notes</h3>
                <StatusNotes>
                  <StyledInput value={statusNotes} onChange={this.onStatusNotesChange} />
                </StatusNotes>
                <SubmitButton disabled={!this.isReadyToSubmit()} onClick={this.submit}>Update</SubmitButton>
              </ModalWrapper>
            </Modal>
          )
        }
      </ModalTransition>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  return {
    app,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS)
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

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClosePSAModal);
