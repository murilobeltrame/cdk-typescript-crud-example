import { DynamoDB } from "aws-sdk";
const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any = {}): Promise<{statusCode:number, body: string}> => {
    const requestedItemId = event.pathParameters.id;
    if (!requestedItemId) return {
        statusCode: 400,
        body: 'Bad Request: You`re missing the path param "id".'
    }
    const params = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: requestedItemId
        }
    }
    try {
        const response = await db.get(params).promise();
        if (!response.Item) return {
            statusCode: 404,
            body: `Not Found: Cannot found item with id ${requestedItemId}`
        }
        return {
            statusCode: 200,
            body: JSON.stringify(response.Item)
        }

    } catch (error) {
        console.error('items::get', error)
        return {
            statusCode: 500,
            body: 'Server Error: Something went wrong when trying to query your data.'
        }
    }
}