/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Constants } from 'lattice';

import Headshot from '../Headshot';
import PSAModal from '../../containers/review/PSAModal';
import StyledCard from '../StyledCard';
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import CONTENT from '../../utils/consts/ContentConsts';
import { getEntityKeyId } from '../../utils/DataUtils';
import { UndecoratedLink } from '../../utils/Layout';
import * as Routes from '../../core/router/Routes';

const { OPENLATTICE_ID_FQN } = Constants;


const StyledUndecoratedLink = styled(UndecoratedLink)`
  display: flex;
  flex-direction: column;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledPersonCard = styled(StyledCard)`
  width: 100%;
`;

const PersonInfoSection = styled.div`
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Name = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #2e2e34;
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const DobLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  color: #8e929b;
`;

const Dob = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  color: #2e2e34;
  margin-right: 5px;
`;

const OpenPSATag = styled.span`
  z-index: 1;
  margin-left: 85px;
  margin-bottom: -8px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 65px;
  height: 16px;
  border-radius: 3px;
  background-color: #8b66db;
  padding: 2px;
  text-transform: uppercase;
  color: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
`;

const TagPlaceholder = styled.span`
  height: 8px;
`;

type Props = {
  personObj :{
    firstName :string,
    middleName :string,
    lastName :string,
    dob :string,
    photo :string,
    identification :string
  },
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  hasOpenPSA? :boolean,
  judgesview? :boolean,
  loadCaseHistoryFn :(values :{
    personId :string,
    neighbors :Immutable.Map<*, *>
  }) => void,
  loadHearingNeighbors :(hearingIds :string[]) => void,
};

type State = {
  open :boolean,
  closing :boolean,
  closePSAButtonActive :boolean
};

class PersonCard extends React.Component<Props, State> {

  static defaultProps = {
    hasOpenPSA: false,
    judgesview: false,
    neighbors: Immutable.Map()
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      open: false,
      closing: false
    };
  }

  handleStatusChange = () => {
    this.setState({ closing: false });
  }

  renderModal = () => {
    const { open } = this.state;
    const modalProps = {};
    Object.keys(this.props).forEach(prop => (modalProps[prop] = Immutable.fromJS(this.props[prop])));
    return (
      <PSAModal
          open={open}
          view={CONTENT.JUDGES}
          onClose={() => this.setState({ open: false })}
          {...modalProps} />
    )
  }


  openDetailsModal = () => {
    const { neighbors, loadCaseHistoryFn, loadHearingNeighbors } = this.props;
    const hearingIds = Immutable.fromJS(neighbors).get(ENTITY_SETS.HEARINGS, Immutable.List())
      .map(neighbor => neighbor.getIn([OPENLATTICE_ID_FQN, 0]))
      .filter(id => !!id)
      .toJS();
    const loadPersonData = false;
    const personId = getEntityKeyId(Immutable.fromJS(neighbors), ENTITY_SETS.PEOPLE);
    loadCaseHistoryFn({ personId, neighbors: Immutable.fromJS(neighbors) });
    loadHearingNeighbors({ hearingIds, loadPersonData });
    this.setState({
      open: true
    });
  }

  renderContent = () => {
    const { personObj } = this.props;
    const {
      firstName,
      middleName,
      lastName,
      dob,
      photo,
      identification
    } = personObj;
    const { hasOpenPSA, judgesview } = this.props;

    const midName = middleName ? ` ${middleName}` : '';
    const name = `${lastName}, ${firstName}${midName}`;

    return hasOpenPSA && judgesview
      ? (
        <CardWrapper onClick={this.openDetailsModal}>
          { this.renderModal() }
          <OpenPSATag>Open PSA</OpenPSATag>
          <StyledPersonCard>
            <Headshot photo={photo} />
            <PersonInfoSection>
              <Name>{name}</Name>
              <div>
                <DobLabel>DOB  </DobLabel>
                <Dob>{dob}</Dob>
              </div>
            </PersonInfoSection>
          </StyledPersonCard>
        </CardWrapper>
      )
      : (
        <StyledUndecoratedLink to={`${Routes.PERSON_DETAILS_ROOT}/${identification}`}>
          <TagPlaceholder />
          <StyledPersonCard>
            <Headshot photo={photo} />
            <PersonInfoSection>
              <Name>{name}</Name>
              <div>
                <DobLabel>DOB  </DobLabel>
                <Dob>{dob}</Dob>
              </div>
            </PersonInfoSection>
          </StyledPersonCard>
        </StyledUndecoratedLink>
      );
  }

  render() {
    return (
      <div>
        {this.renderContent()}
      </div>
    );
  }
}


export default PersonCard;
