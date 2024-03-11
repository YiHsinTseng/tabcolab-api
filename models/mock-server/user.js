/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           example: John Doe
 *         account:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         password:
 *           description: The password must contain at least 8 characters and can only contain letters and numbers.
 *           type: string
 *           pattern: ^[a-zA-Z0-9]{8,}$
 *         paid:
 *           type: boolean
 *         paidDate:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - name
 *         - account
 *         - password
 */
