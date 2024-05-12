const { handleException } = require('../utils/testErrorHandler');
const { testUserAction } = require('../utils/testUserHelper');

class UserRequestBodyTest {
    constructor(userAction, userData) {
        this.userAction = userAction;
        this.userData = userData;
    }

    async jsonFormatError(invalidJson) {
        let res;
        try {
            res = await testUserAction(this.userAction, [invalidJson], 400, 'fail', 'Invalid JSON format in request body');
        } catch (e) {
            handleException(res, e);
        }
    }

    async noField(newUserData = {}, authToken = null, expectedMessage = 'is required') {
        let res;
        try {
            res = await testUserAction(this.userAction, [newUserData, authToken], 400, 'fail', expectedMessage, 'toMatch');
        } catch (e) {
            handleException(res, e);
        }
    }

    async missingField() {
        const testData = Object.keys(this.userData);
        for (let field of testData) {
            it(`Missing ${field} field`, async () => {
                let res;
                try {
                    const { [field]: removedField, ...newUserData } = this.userData;
                    res = await testUserAction(this.userAction, [newUserData], 400, 'fail', `"${field}" is required`);
                } catch (e) {
                    handleException(res, e);
                }
            });
        }
    }

    async undefinedField(authToken = null, expectedMessage = 'not allowed') {
        this.userData.username = 'user';
        let res;
        try {
            res = await testUserAction(this.userAction, [this.userData, authToken], 400, 'fail', expectedMessage, 'toMatch');
        } catch (e) {
            handleException(res, e);
        }
    }

    fieldDataFormatError(authToken = null) {
        const fieldTypeRequired = 'string';
        const userDataFields = Object.keys(this.userData);
        const testReqData = userDataFields.map((field) => ({
            field,
            values: {
                number: 88888888,
                boolean: true,
                // 可以添加更多的值和類型
            },
        }));
        testReqData.forEach(({ field, values }) => {
            Object.entries(values).forEach(([type, value]) => {
                it(`${field} field required ${fieldTypeRequired} (but value type: ${type})`, async () => {
                    // 複製一份用戶數據以避免污染其他測試
                    const testData = { ...this.userData };
                    testData[field] = value;
                    let res;
                    try {
                        res = await testUserAction(this.userAction, [testData, authToken], 400, 'fail', `"${field}" must be a ${fieldTypeRequired}`);
                    } catch (e) {
                        handleException(res, e);
                    }
                });
            });
        });
    }
}

module.exports = { UserRequestBodyTest };