# Mage CDK TypeScript project

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Deploy Mage to AWS with the CDK command
1. Install `cdk` cli
https://docs.aws.amazon.com/cdk/v2/guide/cli.html
```bash
npm install -g aws-cdk
```

2. Deploy Mage to AWS
```bash
npm install
cdk deploy
```

3. Whitelist your IPs in load balancer's security group after deploy completes
* Find the load balancer security group in security group list: https://console.aws.amazon.com/ec2/home?SecurityGroups:search=LBSecurityGroup#SecurityGroups:search=LBSecurityGroup
* Click "Inbound rules" tab
* Click "Edit inbound rule" button
* Add the rule with `HTTP` Type and `My IP` Source
* Click "Save rules" button to apply it

4. Get the load balancer URL from console output from step 2 and use it to access Mage web app.


## Useful commands
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk destroy`     destroy one or more specified stacks
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests

