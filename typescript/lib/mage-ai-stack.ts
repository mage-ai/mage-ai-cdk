import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  APP_ENVIRONMENT,
  APP_NAME,
  AVAILABILITY_ZONES,
  CIDR,
  DOCKER_IMAGE,
  ECS_TASK_CPU,
  ECS_TASK_MEMORY,
} from './constants'
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MageAiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const vpc = new ec2.Vpc(this, `${APP_NAME}-vpc`, {
      availabilityZones: AVAILABILITY_ZONES,
      cidr: CIDR,
    });

    const cluster = new ecs.Cluster(this, `${APP_NAME}-${APP_ENVIRONMENT}-cluster`, {
      vpc: vpc
    });

    // Create a load-balanced Fargate service and make it public
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${APP_NAME}-task`, {
      cpu: ECS_TASK_CPU,
      memoryLimitMiB: ECS_TASK_MEMORY,
    });

    taskDefinition.addContainer('Config', {
      image: ecs.ContainerImage.fromRegistry(DOCKER_IMAGE),
      portMappings: [{containerPort : 6789, hostPort: 6789}],
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, `${APP_NAME}-${APP_ENVIRONMENT}-ecs-service`, {
      cluster: cluster,
      desiredCount: 1,
      taskDefinition:taskDefinition,
      publicLoadBalancer: true,
    });
  }
}
