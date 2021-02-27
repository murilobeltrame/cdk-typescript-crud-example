import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import { Tracing } from '@aws-cdk/aws-lambda';

export class WidgetService extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
        
        const _ = WidgetService;
        const bucket = _.makeBucket(this);
        const lambda = _.makeFunction(this, {"BUCKET": bucket.bucketName});
        bucket.grantReadWrite(lambda);
        const api = _.makeRestApi(this);
        api.root.addMethod('GET', _.makeLambdaIntegration(lambda));
        api.root.addMethod('POST', _.makeLambdaIntegration(lambda));
        const apiResource = api.root.addResource('{id}');
        apiResource.addMethod('GET', _.makeLambdaIntegration(lambda));
        // apiResource.addMethod('PUT', _.makeLambdaIntegration(lambda));
        apiResource.addMethod('DELETE', _.makeLambdaIntegration(lambda));

    }

    static makeLambdaIntegration(lambda: lambda.Function): apigateway.Integration {
        return new apigateway.LambdaIntegration(lambda, {
            requestTemplates: {
                'application/json': '{"statusCode":"200"}'
            }
        });
    }

    private static makeRestApi(scope: cdk.Construct): apigateway.RestApi {
        return new apigateway.RestApi(scope, 'widgets-api', {
            restApiName: 'Widget Service',
            description: 'This service serves widgets'
        });
    }

    private static makeFunction(scope: cdk.Construct, environment: {[key:string]:string}): lambda.Function {
        return new lambda.Function(scope, 'WidgetHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset('resources'),
            handler: 'widgets.main',
            tracing: Tracing.ACTIVE,
            environment: environment
        });
    }

    private static makeBucket(scope: cdk.Construct): s3.Bucket {
        return new s3.Bucket(scope, 'Widgetstore');
    }
}