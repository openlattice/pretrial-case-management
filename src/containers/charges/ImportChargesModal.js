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
  getError,
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
  width: 600px;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;

  > input {
    margin: 10px 0;
  }
`;

type Props = {
  actions :{
    importBulkCharges :RequestSequence;
  };
  importBulkChargesError :Map;
  importBulkChargesRS :RequestState;
  isVisible :boolean;
  onClose :() => void;
};

const ImportChargesModal = (props :Props) => {
  const {
    actions,
    isVisible,
    importBulkChargesError,
    importBulkChargesRS,
    onClose
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
  }, [onClose, setChargeTypeOptions, setFiles]);

  useEffect(() => {
    if (importSuccessful) {
      handleClose();
    }
  }, [handleClose, importSuccessful]);

  const handleChangeFiles = (e) => {
    setFiles(e.target.files);
  };

  const handleImportClick = () => {
    if (chargeTypeOption && files) {
      actions.importBulkCharges({
        file: files[0],
        chargeType: chargeTypeOption.value
      });
    }
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
              <Button color="primary" onClick={() => setChargeTypeOptions(CHARGE_OPTIONS[0])}>Arrest Charges</Button>
              <Button color="primary" onClick={() => setChargeTypeOptions(CHARGE_OPTIONS[1])}>Court Charges</Button>
            </ActionGrid>
          </Flex>
        )
      }
      {
        chargeTypeOption && (
          <Flex>
            <Banner isOpen={importFailed} mode="danger">
              {importBulkChargesError && importBulkChargesError.message}
            </Banner>
            <hr />
            <p>
              File must be a csv with the following criteria:
            </p>
            <l>
              <li>
                Case-sensitive headers: statute, description, degree, short, violent, maxLevelIncrease,
                singleLevelIncrease, bhe, bre. There must not be any additional headers, so trim all empty
                columns before saving.
              </li>
              <li>
                Values for statute AND description must be present.
              </li>
              <li>
                Values for violent, maxLevelIncrease, singleLevelIncrease, bhe, and bre must
                be TRUE, False, or blank.
              </li>
            </l>
            <hr />
            <input
                type="file"
                accept=".csv, .txt, .xls, .xlsx"
                onChange={handleChangeFiles}
                files={files} />
            <hr />
            <Button
                disabled={!(files && files.length)}
                isLoading={loadingCharges}
                color="primary"
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
    importBulkChargesError: getError(charges, IMPORT_BULK_CHARGES)
  };
};

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    importBulkCharges,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ImportChargesModal);
