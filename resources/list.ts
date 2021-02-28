import { DynamoDB } from "aws-sdk";
const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (): Promise<{statusCode:number, body: string}> => {
    const params = {
        TableName: TABLE_NAME
    }
    try {
        const response = await db.scan(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(response.Items)
        }

    } catch (error) {
        console.error('items::get', error)
        return {
            statusCode: 500,
            body: 'Server Error: Something went wrong when trying to query your data.'
        }
    }
}