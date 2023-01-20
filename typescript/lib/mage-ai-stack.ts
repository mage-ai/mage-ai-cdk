import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as efs from 'aws-cdk-lib/aws-efs';
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


export class MageAiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, `${APP_NAME}-vpc`, {
      availabilityZones: AVAILABILITY_ZONES,
      cidr: CIDR,
    });

    // Create ECS cluster
    const cluster = new ecs.Cluster(this, `${APP_NAME}-${APP_ENVIRONMENT}-cluster`, {
      containerInsights: true,
      vpc: vpc,
    });

    // Create Elastic File System
    const fileSystem = new efs.FileSystem(this, `${APP_NAME}-efs`, {
      vpc: vpc,
      encrypted: true,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.ELASTIC
    });

    const volumeConfig = {
      name: `${APP_NAME}-efs-volume`,
      efsVolumeConfiguration: {
        fileSystemId: fileSystem.fileSystemId,
      },
    };

    // Create ECS task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${APP_NAME}-task`, {
      cpu: ECS_TASK_CPU,
      memoryLimitMiB: ECS_TASK_MEMORY,
      volumes: [volumeConfig]
    });

    const container = taskDefinition.addContainer(`${APP_NAME}-${APP_ENVIRONMENT}-container`, {
      image: ecs.ContainerImage.fromRegistry(DOCKER_IMAGE),
      portMappings: [{containerPort : 6789, hostPort: 6789}],
    });

    container.addMountPoints({
      containerPath: "/home/src",
      sourceVolume: volumeConfig.name,
      readOnly: false,
    });

    // Create a load-balanced ECS Fargate service and make it public
    const albFargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      `${APP_NAME}-${APP_ENVIRONMENT}-ecs-service`,
      {
        cluster: cluster,
        desiredCount: 1,
        taskDefinition:taskDefinition,
        openListener: false, // No open to all traffic by default.
        publicLoadBalancer: true,
      },
    );

    // Configure health check for load balancer target group
    albFargateService.targetGroup.configureHealthCheck({
      healthyThresholdCount: 3,
      path: '/api/status',
    });

    albFargateService.service.connections.allowFrom(fileSystem, ec2.Port.tcp(2049));
    albFargateService.service.connections.allowTo(fileSystem, ec2.Port.tcp(2049));
  }
}
