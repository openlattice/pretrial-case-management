// @flow
import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Banner,
  Button,
  Modal,
} from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Dispatch } from 'redux';

import { IMPORT_BULK_CHARGES, importBulkCharges } from './ChargeActions';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';

// Redux State Imports
import {
  getReqState,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';

const CHARGE_OPTIONS = [
  {
    label: 'Arrest',
    value: CHARGE_TYPES.ARREST,
  },
  {
    label: 'Court',
    value: CHARGE_TYPES.COURT,
  }
];

const ActionGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-auto-flow: column;
  margin: 10px 0;
`;

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  > input {
    margin: 10px 0;
  };
`;

type Props = {
  actions :{
    importBulkCharges :RequestSequence;
  };
  isVisible :boolean;
  onClose :() => void;
  importBulkChargesRS :RequestState;
  visibleChargeType :string;
};

const ImportChargesModal = (props :Props) => {
  const {
    actions,
    isVisible,
    onClose,
    importBulkChargesRS,
    visibleChargeType
  } = props;

  const loadingCharges = requestIsPending(importBulkChargesRS);
  const importSuccessful = requestIsSuccess(importBulkChargesRS);
  const importFailed = requestIsFailure(importBulkChargesRS);

  const [chargeTypeOption, setChargeTypeOptions] = useState();
  const [files, setFiles] = useState();

  const handleClose = useCallback(() => {
    onClose();
    setChargeTypeOptions();
    setFiles();
  }, [actions, onClose]);

  useEffect(() => {
    if (importSuccessful) {
      handleClose();
    }
  }, [handleClose, importBulkChargesRS]);

  const handleChangeFiles = (e) => {
    setFiles(e.target.files);
  };

  const handleImportClick = () => {
    actions.importBulkCharges({
      file: files[0],
      chargeType: chargeTypeOption.value
    });
  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={handleClose}
        textTitle="Import Charges">
      {
        !chargeTypeOption && (
          <Flex>
            <p>
              Select the type of charges you would like to import.
            </p>
            <ActionGrid>
              <Button mode="primary" onClick={() => setChargeTypeOptions(CHARGE_OPTIONS[0])}>Arrest Charges</Button>
              <Button mode="primary" onClick={() => setChargeTypeOptions(CHARGE_OPTIONS[1])}>Court Charges</Button>
            </ActionGrid>
          </Flex>
        )
      }
      {
        chargeTypeOption && (
          <Flex>
            <Banner isOpen={importFailed} mode="danger">
              An error occurred when importing charges.
            </Banner>
            <input
                type="file"
                accept=".csv, .txt, .xls, .xlsx"
                onChange={handleChangeFiles}
                files={files} />
            <Button
                disabled={!(files && files.length)}
                isLoading={loadingCharges}
                mode="primary"
                onClick={handleImportClick}>
              {`Import ${chargeTypeOption.label} Charges`}
            </Button>
          </Flex>
        )
      }
    </Modal>
  );
};

const mapStateToProps = (state :Map) => {
  const charges = state.get(STATE.CHARGES);
  return {
    importBulkChargesRS: getReqState(charges, IMPORT_BULK_CHARGES),
  };
};

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    importBulkCharges,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ImportChargesModal);
