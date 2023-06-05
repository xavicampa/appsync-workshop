import {
    Auth,
} from 'aws-amplify';
import { AmplifyUser } from '@aws-amplify/ui';
import { Box, Container, Typography } from '@mui/material';

interface IProps {
    auth: (typeof Auth),
    user: AmplifyUser | null | undefined
}

const Home = (_props: IProps): JSX.Element => {

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    GraphQL workshop
                </Typography>
                <p>During this workshop, we’ll look into authentication, authorization and the integration with multiple backend data sources.</p>
                <p>Requirements:</p>
                <ul>
                    <li>AWS account</li>
                    <li>Python 3.x to run single page application locally</li>
                    <li>Postman</li>
                </ul>
                <p>Optional:</p>
                <ul><li>NodeJS to make changes, rebuild and run the Single Page Application locally</li></ul>
            </Box>
        </Container>
    );
};

export default Home;
