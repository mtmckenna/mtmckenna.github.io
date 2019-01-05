---
layout: post
title: Working Locally with AWS Coginto and aws-amplify
---

[AWS Cognito](https://aws.amazon.com/cognito/) is a pretty neat service for folks looking to go down the [serverless](https://serverless-stack.com/chapters/what-is-serverless.html) path or are just excited about the idea of not having to do the backend management of maintaining a user database, sending password resets, etc.

Adding to Cognito's value proposition is [aws-amplify](https://aws-amplify.github.io/), a JavaScript library AWS provides to handle some of the more annoying aspects of user management on the frontend. This library also has helper functions to add authentication headers to outgoing HTTP requests. The long and short of it is that if you use Cognito for your user management and other AWS services to build out your APIs, aws-amplify can reduce the boilerplate frontend code required to connect them all together. For more information, check out this [super helpful Serverless Stack ebook](https://serverless-stack.com) that runs through a detailed example of how it all works.

One downside to using AWS Cognito, however, is that it's difficult to configure a local development environment. As far as I can tell, if you're using aws-amplify, you're going to need to connect to an actual Cognito User Pool in the AWS cloud, which means you will always need Internet access to connect to Cognito and work on your app. Although this may not be a showstopper, not being able to work locally can slow you down.

To get around this, I have been overriding a handful of aws-amplify methods to fake the user session with a hardcoded user while developing locally. With a hardcoded user session, access to a real AWS Cognito User Pool is not required for most of my development use-cases.

This system also works well with [serverless-offline](https://github.com/dherault/serverless-offline), a plugin for the [serverless framework](https://serverless.com/) that runs a local mock of an [AWS API Gateway](https://aws.amazon.com/api-gateway/). If you're using an API Gateway to [handle user authorization through Cognito](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html), [you can fake the authorization process by setting a custom header](https://github.com/dherault/serverless-offline#custom-headers) ("cognito-identity-id") when using serverless-offline locally.

Below, I've pasted the overridden aws-amplify methods required to fake the user session. It's pretty specific to my use case, but I hope you find it handy for what you're working on as well.

Finally, if you've found another way to work locally with aws-amplify, please let me know! Thank you!

~~~
import { Credentials } from "@aws-amplify/core";
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken
  } from "amazon-cognito-identity-js";
import { Auth } from "aws-amplify";

import config from "./config";

let graphqlHeaders = async () => null;

// If working offline, send a hardcoded identity
if (process.env.REACT_APP_STAGE === "local") {
  graphqlHeaders = async () => ({ "cognito-identity-id": "abc-xyz-123" });
  Credentials.get = () => Promise.resolve("pizza");
  Auth.currentUserInfo = () => Promise.resolve({
    attributes: { email: "local-dev@example.com" }
    });

  Auth.currentSession = () => Promise.resolve({
    getAccessToken: () => new CognitoAccessToken({ AccessToken: "testAccessToken" }),
    getIdToken: () => new CognitoIdToken({ IdToken: "testIdToken" }),
    getRefreshToken: () => new CognitoRefreshToken({ RefreshToken: "testRefreshToken" }),
    isValid: () => true,
  });
}

Amplify.configure({
  API: {
    endpoints: [{
        endpoint: config.apiGateway.URL,
        name: "appname",
        region: config.apiGateway.REGION,
      }],
      graphql_endpoint: config.graphql.GRAPHQL_ENDPOINT,
      graphql_endpoint_iam_region: config.graphql.GRAPHQL_REGION,
      graphql_headers: graphqlHeaders,
  },
  Auth: {
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
});
~~~