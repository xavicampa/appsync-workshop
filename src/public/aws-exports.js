const awsconfig = {
    aws_appsync_graphqlEndpoint: 'https://emd4skwbfzavxajooru4yp676u.appsync-api.eu-west-1.amazonaws.com/graphql',
    aws_appsync_region: 'eu-west-1',
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    Auth: {
        oauth: {
            domain: '668068975945.auth.eu-west-1.amazoncognito.com',
            scope: ['openid', 'profile', 'aws.cognito.signin.user.admin'],
            redirectSignIn: 'http://localhost:3000/signIn',
            redirectSignOut: 'http://localhost:3000/signOut',
            responseType: 'code',
        },
        region: 'eu-west-1',
        storage: sessionStorage,
        userPoolId: 'eu-west-1_iFAj6gX3c',
        userPoolWebClientId: '3p44set5bc43chq47mcmlqvdgm'
    }
};
