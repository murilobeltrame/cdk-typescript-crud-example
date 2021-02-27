import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as HelloTypescriptLambdas from '../lib/hello-typescript-lambdas-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new HelloTypescriptLambdas.HelloTypescriptLambdasStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
