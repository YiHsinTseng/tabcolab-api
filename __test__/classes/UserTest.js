const { handleException } = require('../utils/testErrorHandler');
const { testUserAction } = require('../utils/testUserHelper');
const { getNewToken } = require('../utils/getNewToken');

class UserRequestBodyTest {
  constructor(userAction, userData, requestData = null) {
    this.userAction = userAction;
    this.userData = userData;
    this.requestData = requestData;
  }

  async jsonFormatError(invalidJson, additionalParams = []) {
    let res;
    try {
      const params = [...additionalParams, invalidJson];
      res = await testUserAction(this.userAction, params, 400, 'fail', 'Invalid JSON format in request body');
    } catch (e) {
      handleException(res, e);
    }
  }

  async noField(newUserData = {}, authToken = null, expectedMessage = 'is required', additionalParams = []) {
    let res;
    try {
      const params = [...additionalParams, newUserData, authToken];
      res = await testUserAction(this.userAction, params, 400, 'fail', expectedMessage, 'toMatch');
    } catch (e) {
      handleException(res, e);
    }
  }

  async missingField(authToken = null, additionalParams = []) {
    const testData = Object.keys(this.requestData);
    for (const field of testData) {
      it(`Missing ${field} field`, async () => {
        const token = await getNewToken(this.userData);
        const Token = authToken || token;
        let res;
        try {
          const { [field]: removedField, ...newRequestData } = this.requestData;
          const params = [...additionalParams, newRequestData, Token];
          res = await testUserAction(this.userAction, params, 400, 'fail', `"${field}" is required`);
          console.log(res.body);
        } catch (e) {
          handleException(res, e);
        }
      });
    }
  }

  async undefinedField(authToken = null, expectedMessage = 'not allowed', additionalParams = []) {
    this.requestData.undefinedField = 'undefined';
    let res;
    try {
      const params = [...additionalParams, this.requestData, authToken];
      res = await testUserAction(this.userAction, params, 400, 'fail', expectedMessage, 'toMatch');
    } catch (e) {
      handleException(res, e);
    } finally {
      delete this.requestData.undefinedField;
    }
  }

  async fieldDataFormatError(authToken = null, additionalParams = [], expectedMessage = null) {
    const fieldTypesRequired = {
      browserTab_id: 'number',
      browserTab_index: 'number',
      browserTab_active: 'boolean',
      windowId: 'number',
      targetItem_position: 'number',
      item_type: 'number',
      doneStatus: 'boolean',
    };
    const testValues = {
      string: {
        number: 88888888,
        boolean: true,
      },
      number: {
        string: 'test',
        boolean: true,
      },
      boolean: {
        string: 'test',
        number: 88888888,
      },
    };
    const requestDataFields = Object.keys(this.requestData);
    const testReqData = requestDataFields.map((field) => ({
      field,
      values: testValues[fieldTypesRequired[field] || 'string'],
    }));
    for (const { field, values } of testReqData) {
      for (const [type, value] of Object.entries(values)) {
        const fieldTypeRequired = fieldTypesRequired[field] || 'string';
        it(`${field} field required ${fieldTypeRequired} (but value type: ${type})`, async () => {
          const token = await getNewToken(this.userData);
          const Token = authToken || token;
          // 复制一份用户数据以避免污染其他测试
          const testData = { ...this.requestData };
          testData[field] = value;
          let res;
          try {
            const params = [...additionalParams, testData, Token];
            const errorMessage = expectedMessage || `"${field}" must be a ${fieldTypeRequired}`;
            res = await testUserAction(this.userAction, params, 400, 'fail', errorMessage);
          } catch (e) {
            handleException(res, e);
          }
        });
      }
    }
  }
}

class UserGroupTest {
  constructor(registerUser, getGroup) {
    this.registerUser = registerUser;
    this.getGroup = getGroup;
  }

  async registerAndTestGroup(userData) {
    let res;
    try {
      const registerResponse = await this.registerUser(userData);
      const authToken = registerResponse.body.token;
      res = await testUserAction(this.getGroup, [authToken], 404, 'fail', 'No groups found for the user');
    } catch (e) {
      this.handleException(res, e);
    }
  }
}

module.exports = { UserRequestBodyTest, UserGroupTest };
