import Immutable from 'immutable';

import { PROPERTY_TYPES } from './consts/DataModelConsts';

import {
  stripIdField,
  getFqnObj,
  getEntitySetId,
  getEntityKeyId,
  getIdOrValue
} from './DataUtils';

const ID = 'id';
const ID_FQN = 'openlattice.@id';

describe('DataUtils', () => {

  describe('stripIdField', () => {

    test('should remove all id fields from javascript objects', () => {

      expect(stripIdField({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      })).toEqual({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      });

      expect(stripIdField({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id'],
        [ID]: ['id_value'],
        [ID_FQN]: ['id_fqn_value']
      })).toEqual({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      });

      expect(stripIdField({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id'],
        [ID]: ['id_value']
      })).toEqual({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      });

      expect(stripIdField({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id'],
        [ID_FQN]: ['id_fqn_value']
      })).toEqual({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      });

      expect(stripIdField({
        [ID]: ['id_value'],
        [ID_FQN]: ['id_fqn_value']
      })).toEqual({});

    });

    test('should remove all id fields from Immutable Maps', () => {

      expect(stripIdField(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      }))).toEqual(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      }));

      expect(stripIdField(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id'],
        [ID]: ['id_value'],
        [ID_FQN]: ['id_fqn_value']
      }))).toEqual(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      }));

      expect(stripIdField(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id'],
        [ID]: ['id_value']
      }))).toEqual(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      }));

      expect(stripIdField(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id'],
        [ID_FQN]: ['id_fqn_value']
      }))).toEqual(Immutable.fromJS({
        field1: ['test'],
        field2: ['test2', 'test3'],
        idNotIdField: ['id']
      }));

      expect(stripIdField(Immutable.fromJS({
        [ID]: ['id_value'],
        [ID_FQN]: ['id_fqn_value']
      }))).toEqual(Immutable.Map());

    });

  });

  describe('getFqnObj', () => {

    test('should return an FQN object with namespace and name field on properly formatted input', () => {

      expect(getFqnObj('test.test')).toEqual({
        namespace: 'test',
        name: 'test'
      });

      expect(getFqnObj('nc.PersonGivenName')).toEqual({
        namespace: 'nc',
        name: 'PersonGivenName'
      });

      expect(getFqnObj('test.')).toEqual({
        namespace: 'test',
        name: ''
      });

      expect(getFqnObj('.test')).toEqual({
        namespace: '',
        name: 'test'
      });

      expect(getFqnObj('test')).toEqual({
        namespace: 'test',
        name: undefined
      });

    });
  });

  describe('getEntitySetId', () => {

    test('should return entity set id from neighbor map', () => {

      expect(getEntitySetId(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          }
        }
      }), 'esName')).toEqual('es_id_1');

      expect(getEntitySetId(Immutable.fromJS({
        esName2: {
          neighborId: 'neighborId',
          neighborDetails: {
            pt: ['val']
          },
          neighborEntitySet: {
            id: 'es_id_2'
          }
        }
      }), 'esName2')).toEqual('es_id_2');

    });

    test('should return empty string if neighbor entity set is not present', () => {

      expect(getEntitySetId(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            notId: 'es_id_1'
          }
        }
      }), 'esName')).toEqual('');

      expect(getEntitySetId(Immutable.fromJS({
        esName: {
          neighborDetails: {
            notId: 'es_id_1'
          }
        }
      }), 'esName')).toEqual('');

      expect(getEntitySetId(Immutable.fromJS({
        esName2: {
          neighborDetails: {
            notId: 'es_id_1'
          }
        }
      }), 'esName')).toEqual('');

    });

  });

  describe('getEntityKeyId', () => {

    test('should return entity key id from neighbor details obj', () => {

      expect(getEntityKeyId(Immutable.fromJS({
        esName: {
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: ['ekid_1']
          }
        }
      }), 'esName')).toEqual('ekid_1');

      expect(getEntityKeyId(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: ['ekid_1']
          }
        }
      }), 'esName')).toEqual('ekid_1');

      expect(getEntityKeyId(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: ['ekid_1', 'WRONG_ID']
          }
        }
      }), 'esName')).toEqual('ekid_1');

    });

    test('should return empty string if neighbor entity key id not present', () => {

      expect(getEntityKeyId(Immutable.fromJS({
        esName: {
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: ['']
          }
        }
      }), 'esName')).toEqual('');

      expect(getEntityKeyId(Immutable.fromJS({
        esName: {
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: []
          }
        }
      }), 'esName')).toEqual('');

      expect(getEntityKeyId(Immutable.fromJS({
        esName: {
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3']
          }
        }
      }), 'esName')).toEqual('');

      expect(getEntityKeyId(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: ['es_id']
          }
        }
      }), 'esName')).toEqual('');

      expect(getEntityKeyId(Immutable.fromJS({
        esName2: {
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: ['ekid_2']
          }
        }
      }), 'esName')).toEqual('');

    });

  });

  describe('getIdOrValue', () => {

    test('should return id for default property general.id', () => {

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['eid_1']
          }
        }
      }), 'esName')).toEqual('eid_1');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            pt1: ['val1'],
            pt2: ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['eid_1']
          }
        }
      }), 'esName')).toEqual('eid_1');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            'pt.1': ['val1'],
            'pt.2': ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['eid_1', 'eid_2']
          }
        }
      }), 'esName')).toEqual('eid_1');

    });

    test('should return id for custom FQN', () => {

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborDetails: {
            'pt.1': ['val1'],
            'pt.2': ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['eid_1']
          }
        }
      }), 'esName', 'pt.1')).toEqual('val1');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            'pt.1': ['val1'],
            'pt.2': ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['eid_1']
          }
        }
      }), 'esName', 'pt.2')).toEqual('val2');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            'pt.1': ['val1'],
            'pt.2': ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['eid_1', 'eid_2']
          }
        }
      }), 'esName', PROPERTY_TYPES.GENERAL_ID)).toEqual('eid_1');

    });

    test('should return empty string if id value is not present', () => {

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborDetails: {
            'pt.1': [],
            'pt.2': ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['']
          }
        }
      }), 'esName', 'pt.1')).toEqual('');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            'pt.1': ['val1'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: ['']
          }
        }
      }), 'esName', 'pt.2')).toEqual('');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          }
        }
      }), 'esName', PROPERTY_TYPES.GENERAL_ID)).toEqual('');

      expect(getIdOrValue(Immutable.fromJS({
        esName2: {
          neighborEntitySet: {
            id: 'es_id_1'
          }
        }
      }), 'esName', PROPERTY_TYPES.GENERAL_ID)).toEqual('');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborDetails: {
            'pt.1': ['val1'],
            'pt.2': ['val2', 'val3'],
            [ID_FQN]: ['ekid_1'],
            [PROPERTY_TYPES.GENERAL_ID]: []
          }
        }
      }), 'esName')).toEqual('');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          },
          neighborDetails: {
            'pt.1': ['val1'],
            [ID_FQN]: ['ekid_1']
          }
        }
      }), 'esName', 'pt.2')).toEqual('');

      expect(getIdOrValue(Immutable.fromJS({
        esName: {
          neighborEntitySet: {
            id: 'es_id_1'
          }
        }
      }), 'esName')).toEqual('');

      expect(getIdOrValue(Immutable.fromJS({
        esName2: {
          neighborEntitySet: {
            id: 'es_id_1'
          }
        }
      }), 'esName')).toEqual('');

    });

  });

});
