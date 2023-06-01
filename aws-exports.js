const awsconfig = {
    aws_appsync_graphqlEndpoint: '%GRAPHQLAPIURL%',
    aws_appsync_region: 'eu-west-1',
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    Auth: {
        oauth: {
            domain: 'auth.dev.aidee.io',
            scope: ['openid', 'profile', 'aws.cognito.signin.user.admin'],
            redirectSignIn: 'http://localhost:3000/signIn',
            redirectSignOut: 'http://localhost:3000/signOut',
            responseType: 'code',
        },
        region: 'eu-west-1',
        storage: sessionStorage,
        userPoolId: '%USERPOOLID%',
        userPoolWebClientId: '%WEBCLIENTID%'
    }
};
