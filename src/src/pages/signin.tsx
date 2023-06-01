import {
    Auth,
} from 'aws-amplify';
import { AmplifyUser } from '@aws-amplify/ui';
import { Box, Button, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IProps {
    auth: (typeof Auth),
    user: AmplifyUser | null | undefined
}

const SignIn = (props: IProps): JSX.Element => {

    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    const { user } = props;

    useEffect(() => {
        setLoading(props.user === undefined);
        if (props.user) {
            console.log(props.user);
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <Container maxWidth="sm">
            {
                loading &&
                <p>Loading...</p>
            }
            {
                !loading &&
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        GraphQL workshop<br />Webstep Solutions 2023
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={
                            () => {
                                setLoading(true);
                                props.auth.federatedSignIn()
                                    .then(() => setLoading(true));
                            }
                        }
                    >
                        Sign In
                    </Button>
                </Box>
            }
        </Container>
    );
};

export default SignIn;
