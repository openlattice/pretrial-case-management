import Immutable from 'immutable';

import { getMapByCaseId } from './CaseUtils';

describe('CaseUtils', () => {

  describe('getMapByCaseId', () => {

    test('should return an immutable map based with case ids as keys', () => {

      expect(getMapByCaseId(Immutable.fromJS([
        {
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        },
        {
          'fqn.key': ['case2|1'],
          'other.value': ['val2']
        },
        {
          'fqn.key': ['case3|1'],
          'other.value': ['val3']
        }
      ]), 'fqn.key')).toEqual(Immutable.fromJS({
        case1: [{
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        }],
        case2: [{
          'fqn.key': ['case2|1'],
          'other.value': ['val2']
        }],
        case3: [{
          'fqn.key': ['case3|1'],
          'other.value': ['val3']
        }]
      }));

      expect(getMapByCaseId(Immutable.fromJS([
        {
          'fqn.key': ['case1|1'],
          'other.value': ['val1|']
        },
        {
          'fqn.key': ['case2|1'],
          'other.value': ['val2|']
        },
        {
          'fqn.key': ['case3|1'],
          'other.value': ['val3|']
        }
      ]), 'other.value')).toEqual(Immutable.fromJS({
        val1: [{
          'fqn.key': ['case1|1'],
          'other.value': ['val1|']
        }],
        val2: [{
          'fqn.key': ['case2|1'],
          'other.value': ['val2|']
        }],
        val3: [{
          'fqn.key': ['case3|1'],
          'other.value': ['val3|']
        }]
      }));

    });

    test('should return an immutable map based with case ids as keys with multiple elements from same case', () => {

      expect(getMapByCaseId(Immutable.fromJS([
        {
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        },
        {
          'fqn.key': ['case1|2'],
          'other.value': ['val3']
        },
        {
          'fqn.key': ['case2|1'],
          'other.value': ['val2']
        }
      ]), 'fqn.key')).toEqual(Immutable.fromJS({
        case1: [
          {
            'fqn.key': ['case1|1'],
            'other.value': ['val1']
          },
          {
            'fqn.key': ['case1|2'],
            'other.value': ['val3']
          }
        ],
        case2: [
          {
            'fqn.key': ['case2|1'],
            'other.value': ['val2']
          }
        ]
      }));

      expect(getMapByCaseId(Immutable.fromJS([
        {
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        },
        {
          'fqn.key': ['case1|2'],
          'other.value': ['val2']
        },
        {
          'fqn.key': ['case1|3'],
          'other.value': ['val3']
        }
      ]), 'fqn.key')).toEqual(Immutable.fromJS({
        case1: [
          {
            'fqn.key': ['case1|1'],
            'other.value': ['val1']
          },
          {
            'fqn.key': ['case1|2'],
            'other.value': ['val2']
          },
          {
            'fqn.key': ['case1|3'],
            'other.value': ['val3']
          }
        ]
      }));

    });

    test('should ignore missing or malformed keys from map', () => {

      expect(getMapByCaseId(Immutable.fromJS([
        {
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        },
        {
          'fqn.key': ['case2|1'],
          'other.value': ['val2']
        },
        {
          'fqn.key': ['case3|1'],
          'other.value': ['val3']
        }
      ]), 'other.value')).toEqual(Immutable.Map());

      expect(getMapByCaseId(Immutable.fromJS([
        {
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        },
        {
          'fqn.key': ['case2|1'],
          'other.value': ['val2']
        },
        {
          'fqn.key': ['case3|1'],
          'other.value': ['val3']
        }
      ]), 'other.value2')).toEqual(Immutable.Map());

      expect(getMapByCaseId(Immutable.fromJS([
        {
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        },
        {
          'fqn.key': ['case2|1'],
          'other.value': ['val2']
        },
        {
          'fqn.key': ['case3'],
          'other.value': ['val3']
        }
      ]), 'fqn.key')).toEqual(Immutable.fromJS({
        case1: [{
          'fqn.key': ['case1|1'],
          'other.value': ['val1']
        }],
        case2: [{
          'fqn.key': ['case2|1'],
          'other.value': ['val2']
        }]
      }));

    });

  });

});
