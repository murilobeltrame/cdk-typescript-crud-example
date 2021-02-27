import * as cdk from '@aws-cdk/core';
import { WidgetService } from './widget-service';

export class HelloTypescriptLambdasStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new WidgetService(this, 'Widgets');
  }
}
