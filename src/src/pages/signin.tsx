import {
    Auth,
} from 'aws-amplify';
import { AmplifyUser } from '@aws-amplify/ui';
import { Alert, Avatar, Box, Button, Container, CssBaseline, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface IProps {
    auth: (typeof Auth),
    user: AmplifyUser | null | undefined
}

const SignIn = (props: IProps): JSX.Element => {

    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(props.user === undefined);
        if (props.user) {
            console.log(props.user);
            navigate('/');
        }
    }, [props.user, navigate]);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {
                    loading &&
                    <p>Loading...</p>
                }
                {
                    !loading &&
                    <>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            GraphQL workshop
                        </Typography>
                        <Alert
                            severity="info">
                            On first sign in, use the credentials provided by the provisioning script.
                        </Alert>
                        <Button
                            color="success"
                            variant="contained"
                            onClick={
                                () => {
                                    setLoading(true);
                                    props.auth.federatedSignIn()
                                        .then(() => setLoading(true));
                                }
                            }
                        >
                            Sign in
                        </Button>
                    </>
                }
            </Box>
        </Container >
    );
};

export default SignIn;
