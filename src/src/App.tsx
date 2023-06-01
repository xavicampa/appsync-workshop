import './App.css';
import {
    Auth,
} from 'aws-amplify';
import { Box, Button, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { AmplifyUser } from '@aws-amplify/ui';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignIn from './pages/signin';

interface IProps {
    auth: (typeof Auth);
}

const App = (props: IProps): JSX.Element => {

    const [user, setUser] = useState<AmplifyUser | undefined | null>();

    //  Hydrate user
    useEffect(() => {
        props.auth.currentAuthenticatedUser()
            .then((user) => {

                //  Inspect groups
                if ('cognito:groups' in user.signInUserSession.idToken.payload) {
                }

                // Set user identity
                setUser(user);

                // Deal with refresh token
                props.auth.currentSession();
            })
            .catch(
                () => {
                    setUser(null);
                }
            );

    }, [props.auth]);

    return (
        <BrowserRouter>
            <Routes>
                {
                    user &&
                    <Route path="/*" element={
                        <Container maxWidth="sm">
                            <Box sx={{ my: 4 }}>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    GraphQL workshop<br/>Webstep Solutions 2023
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={
                                        () => {
                                            props.auth.signOut()
                                        }
                                    }
                                >
                                    Sign Out
                                </Button>
                            </Box>
                        </Container>
                    }>
                    </Route>
                }
                {
                    !user &&
                    <Route path="/*" element={
                        <SignIn auth={props.auth} user={user} />
                    } />
                }

            </Routes>
        </BrowserRouter>
    );
}

export default App;
