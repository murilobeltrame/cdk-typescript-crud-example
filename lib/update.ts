import { DynamoDB } from "aws-sdk";
const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any = {}): Promise<{statusCode:number, body: string}> => {
    if (!event.body) return { statusCode: 400, body: 'Bad Request: You`re missing the request body.' }

    const editingItemId = event.pathParameters.id;
    if (!editingItemId) return { statusCode: 400, body: 'Bad Request: You`re missing the path param "id".' }
    
    const queryingParams = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: editingItemId
        }
    }
    try {
        const response = await db.get(queryingParams).promise();
        if (!response.Item) return { statusCode: 404, body: `Not Found: Cannot found item with id ${editingItemId}` }

        const editedItem: any = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
        const editedItemProperties = Object.keys(editedItem);
        if (!editedItem || editedItemProperties.length < 1) { return { statusCode: 400, body: 'Bad Request: No arguments provided.' }; }

        const firstProperty = editedItemProperties.splice(0,1);
        const editingParams: any = {
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: editingItemId
            },
            UpdateExpression: `set ${firstProperty} =:${firstProperty}`,
            ExpressionAttributeValues: {},
            ReturnValues: 'UPDATED_NEW'
        }
        editingParams.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];
        editedItemProperties.forEach(property => {
            editingParams.UpdateExpression += `, ${property} = :${property}`;
            editingParams.ExpressionAttributeValues[`:${property}`] = editedItem[property];
        });

        await db.update(editingParams).promise();
        return { statusCode: 204, body: '' }

    } catch (error) {
        console.error('items::update', error)
        return { statusCode: 500, body: 'Server Error: Something went wrong when trying to process your data.' }
    }
}