#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { HelloTypescriptLambdasStack } from '../lib/hello-typescript-lambdas-stack';

const app = new cdk.App();
new HelloTypescriptLambdasStack(app, 'HelloTypescriptLambdasStack');
