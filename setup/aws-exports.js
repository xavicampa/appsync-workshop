const awsconfig = {
    aws_appsync_graphqlEndpoint: '%GRAPHQLAPIURL%',
    aws_appsync_region: '%AWS_REGION%',
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    Auth: {
        oauth: {
            domain: '%COGNITODOMAIN%',
            scope: ['openid', 'profile', 'aws.cognito.signin.user.admin'],
            redirectSignIn: 'http://localhost:3000/',
            redirectSignOut: 'http://localhost:3000/',
            responseType: 'code',
        },
        region: '%AWS_REGION%',
        storage: sessionStorage,
        userPoolId: '%USERPOOLID%',
        userPoolWebClientId: '%WEBCLIENTID%'
    }
};
