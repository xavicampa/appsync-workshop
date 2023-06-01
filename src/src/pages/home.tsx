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
                    GraphQL workshop<br />Webstep Solutions 2023
                </Typography>
            </Box>
        </Container>
    );
};

export default Home;
