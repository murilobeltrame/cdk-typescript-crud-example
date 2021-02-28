import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";
const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any = {}): Promise<{statusCode:number, body: string}> => {
    if (!event.body) return {
        statusCode: 400,
        body: 'Bad Request: You`re missing the request body.'
    }
    try {
        const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
        item[PRIMARY_KEY] = uuid.v4();
        item.createdAt = new Date().toUTCString();
        const params = {
            TableName: TABLE_NAME,
            Item: item
        }
        await db.put(params).promise()
        return {
            statusCode: 201,
            body: JSON.stringify(item)
        }
    } catch (error) {
        console.error('items::create', error);
        return {
            statusCode: 500,
            body: 'Server Error: Something went wrong when trying to process your data.'
        }
    }

}