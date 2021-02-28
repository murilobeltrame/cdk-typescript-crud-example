import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { Code, Function, Runtime, Tracing } from '@aws-cdk/aws-lambda';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';

export class ItemService extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        
        const _ = ItemService;

        const table = _.makeTable(this);
        
        const getListLambda = _.makeLambda(this, `${table.tableName}ListHandler`, 'list.handler', table.tableName);
        table.grantReadData(getListLambda);

        const getLambda = _.makeLambda(this, `${table.tableName}GetHandler`, 'get.handler', table.tableName);
        table.grantReadData(getListLambda);

        const createLambda = _.makeLambda(this, `${table.tableName}CreateHandler`, 'create.handler', table.tableName);
        table.grantWriteData(getListLambda);

        const updateLambda = _.makeLambda(this, `${table.tableName}UpdateHandler`, 'update.handler', table.tableName);
        table.grantReadWriteData(getListLambda);

        const deleteLambda = _.makeLambda(this, `${table.tableName}DeleteHandler`, 'delete.handler', table.tableName);
        table.grantReadWriteData(getListLambda);

        const api = _.makeRestApi(this);
        const itemsApi = api.root.addResource('items');
        itemsApi.addMethod('GET', new LambdaIntegration(getListLambda));
        itemsApi.addMethod('POST', new LambdaIntegration(createLambda));
        const itemsApiResource = itemsApi.addResource('{id}');
        itemsApiResource.addMethod('GET', new LambdaIntegration(getLambda));
        itemsApiResource.addMethod('PUT', new LambdaIntegration(updateLambda));
        itemsApiResource.addMethod('DELETE', new LambdaIntegration(deleteLambda));

    }

    private static makeRestApi(scope: Construct): RestApi {
        return new RestApi(scope, 'items-api', {
            restApiName: 'Items Service',
            description: 'This service serves items'
        });
    }

    private static makeLambda(scope: Construct, name: string, handler: string, tableName: string): Function {
        return new Function(scope, name, {
            runtime: Runtime.NODEJS_12_X,
            code: Code.fromAsset('resources'),
            handler: handler,
            tracing: Tracing.ACTIVE,
            environment: {
                TABLE_NAME: tableName,
                PRIMARY_KEY: 'itemId'
            }
        });
    }

    private static makeTable(context: Construct): Table {
        return new Table(context, 'items', {
            partitionKey: {
                name: 'itemId',
                type: AttributeType.STRING
            },
            tableName: 'items',
            removalPolicy: RemovalPolicy.DESTROY
        });
    }
}